# 역할: 포트폴리오 저장 로직 — 입력 검증 · 길이 제한 · 교체된 이미지 파일 정리

from datetime import date
from typing import Any

from fastapi import Request

from app.core.utils import media
from app.core.utils.response import fail
from app.module.portfolio.portfolio import PortfolioInfo, PortfolioProject
from app.module.portfolio.portfolio_repository import PortfolioRepository

# 업로드 종류별 media 하위 경로.
# 클라이언트가 보낸 문자열을 경로로 쓰지 않고, 이 표에 있는 값만 허용한다.
UPLOAD_SUBFOLDERS = {
    "profile": "portfolio/profile",
    "link": "portfolio/link",
    "stack": "portfolio/stack",
    "project": "portfolio/project",
}
DEFAULT_UPLOAD_KIND = "profile"

# Approach 카드 상한. 화면이 2열 3행으로 짜여 있어 6개가 정확히 채워진다
APPROACH_MAX = 6

# 프로젝트의 짧은 문자열 필드와 최대 길이. 모델 컬럼 길이와 같아야 한다
PROJECT_TEXT_FIELDS = {
    "name": 100,
    "kind": 20,
    "category": 30,
    "status": 20,
    "role": 50,
    "team": 200,
    "summary": 300,
}
# 프로젝트의 문자열 목록 필드와 항목당 최대 길이
PROJECT_LIST_FIELDS = {
    "tech_stack": 50,
    "tags": 50,
    "integrations": 100,
}

# 제목 + 설명 구조의 세 절. 항목은 {"title", "body"} 이고 개수 제한은 두지 않는다
PROJECT_POINT_FIELDS = ("highlights", "features", "improvements")
POINT_TITLE_MAX = 100
POINT_BODY_MAX = 600

# 화면이 항상 같은 모양의 데이터를 받도록, 아직 저장된 값이 없을 때 쓰는 기본값
EMPTY_INFO: dict[str, Any] = {
    "subtitle": "",
    "role_label": "",
    "name": "",
    "headline": "",
    "description": "",
    "profile_image": None,
    "tags": [],
    "links": [],
    "careers": [],
    "educations": [],
    "certificates": [],
    "layout": "header",
}

# 공개 화면 구성 값
LAYOUTS = ("header", "sidebar")

# 경력 · 학력 · 자격증 항목의 키. 문자열 키는 잘라서 받고, items 는 문자열 목록
RECORD_KEYS = {
    "careers": (("org", 100), ("role", 100), ("period", 60)),
    "educations": (("school", 100), ("major", 100), ("period", 60)),
    "certificates": (("name", 100), ("issuer", 100), ("date", 60)),
}

# links 항목에서 받는 키.
# icon_image — 업로드한 아이콘의 `media/...` 상대경로
LINK_KEYS = ("label", "sub", "href")
LINK_IMAGE_KEY = "icon_image"


class PortfolioService:
    def __init__(self, portfolio_repo: PortfolioRepository):
        self.portfolio_repo = portfolio_repo

    # ── 조회 ────────────────────────────────────────────────

    async def get_info(self) -> dict:
        info = await self.portfolio_repo.get_info()
        if info is None:
            return dict(EMPTY_INFO)
        return self._to_dict(info)

    # ── 수정 ────────────────────────────────────────────────

    async def update_info(self, request: Request) -> dict:
        body = await self._read_json(request)

        fields = {
            "subtitle": self._text(body, "subtitle", 200),
            "role_label": self._text(body, "role_label", 100),
            "name": self._text(body, "name", 100),
            "headline": self._text(body, "headline", 300),
            "description": self._text(body, "description", 2000),
            "tags": self._tags(body.get("tags")),
            "links": self._links(body.get("links")),
            "careers": self._records(body.get("careers"), "careers"),
            "educations": self._records(body.get("educations"), "educations"),
            "certificates": self._records(body.get("certificates"), "certificates"),
            "layout": self._layout(body.get("layout")),
        }

        # profile_image 는 키가 들어온 경우에만 손댄다.
        # 키가 없으면 "이미지는 그대로 두고 텍스트만 수정" 하는 요청이다.
        if "profile_image" in body:
            new_path = (body.get("profile_image") or "").strip() or None
            if new_path and not media.is_media_path(new_path):
                fail("잘못된 이미지 경로입니다.")

            current = await self.portfolio_repo.get_info()
            old_path = current.profile_image if current else None
            fields["profile_image"] = new_path

            # 교체되거나 지워졌으면 이전 파일을 정리한다
            if old_path and old_path != new_path:
                media.delete_media(old_path)

        # 링크에서 떨어져 나간 아이콘 파일을 정리한다.
        # 안 하면 교체할 때마다 media/ 에 안 쓰는 파일이 쌓인다.
        current = await self.portfolio_repo.get_info()
        removed_icons = self._link_images(current.links if current else []) - self._link_images(
            fields["links"]
        )

        info = await self.portfolio_repo.upsert_info(fields)

        for path in removed_icons:
            media.delete_media(path)

        return self._to_dict(info)

    # ── 이미지 업로드 ───────────────────────────────────────

    async def upload_image(self, request: Request) -> dict:
        """이미지를 media/ 에 저장하고 상대경로를 돌려준다.

        form 필드
          file — 이미지 파일
          kind — "profile" | "link" (기본 profile)
        """
        form = await request.form()
        upload = form.get("file")

        if upload is None or not hasattr(upload, "filename"):
            fail("이미지 파일이 없습니다. file 필드로 보내주세요.")

        kind = str(form.get("kind") or DEFAULT_UPLOAD_KIND).strip()
        subfolder = UPLOAD_SUBFOLDERS.get(kind)
        if subfolder is None:
            allowed = ", ".join(sorted(UPLOAD_SUBFOLDERS))
            fail(f"알 수 없는 업로드 종류입니다. ({allowed})")

        path = await media.save_upload(upload, subfolder)
        return {"path": path}

    # ── 내부 헬퍼 ───────────────────────────────────────────

    @staticmethod
    def _to_dict(info: PortfolioInfo) -> dict:
        return {
            "subtitle": info.subtitle or "",
            "role_label": info.role_label or "",
            "name": info.name or "",
            "headline": info.headline or "",
            "description": info.description or "",
            "profile_image": info.profile_image,
            "tags": info.tags or [],
            "links": info.links or [],
            "careers": info.careers or [],
            "educations": info.educations or [],
            "certificates": info.certificates or [],
            "layout": info.layout or "header",
        }

    @staticmethod
    async def _read_json(request: Request) -> dict:
        try:
            body = await request.json()
        except Exception:
            fail("요청 본문이 올바른 JSON 이 아닙니다.")
        if not isinstance(body, dict):
            fail("요청 본문이 올바른 JSON 이 아닙니다.")
        return body

    @staticmethod
    def _text(body: dict, key: str, max_length: int) -> str:
        value = body.get(key, "")
        if value is None:
            value = ""
        if not isinstance(value, str):
            fail(f"{key} 는 문자열이어야 합니다.")
        value = value.strip()
        if len(value) > max_length:
            fail(f"{key} 는 {max_length}자를 넘을 수 없습니다.")
        return value

    @staticmethod
    def _tags(raw: Any) -> list[str]:
        if raw is None:
            return []
        if not isinstance(raw, list):
            fail("tags 는 배열이어야 합니다.")

        tags: list[str] = []
        for item in raw:
            if not isinstance(item, str):
                fail("tags 항목은 문자열이어야 합니다.")
            label = item.strip()
            if label:
                tags.append(label[:50])
        return tags

    @staticmethod
    def _links(raw: Any) -> list[dict]:
        if raw is None:
            return []
        if not isinstance(raw, list):
            fail("links 는 배열이어야 합니다.")

        links: list[dict] = []
        for item in raw:
            if not isinstance(item, dict):
                fail("links 항목은 객체여야 합니다.")

            link = {key: str(item.get(key) or "").strip()[:255] for key in LINK_KEYS}

            icon_image = (item.get(LINK_IMAGE_KEY) or "").strip() or None
            if icon_image and not media.is_media_path(icon_image):
                fail("잘못된 아이콘 이미지 경로입니다.")
            link[LINK_IMAGE_KEY] = icon_image

            if not link["label"] and not link["href"]:
                continue
            links.append(link)
        return links

    @staticmethod
    def _layout(raw: Any) -> str:
        """화면 구성. 비어 있으면 헤더형"""
        value = str(raw or "header").strip()
        if value not in LAYOUTS:
            fail(f"layout 은 {' / '.join(LAYOUTS)} 중 하나여야 합니다.")
        return value

    @staticmethod
    def _records(raw: Any, key: str) -> list[dict]:
        """경력 · 학력 · 자격증 목록. 정해진 문자열 키만 받고, 경력의 items 는 빈 줄을 뺀 문자열 목록으로"""
        if raw is None:
            return []
        if not isinstance(raw, list):
            fail(f"{key} 는 배열이어야 합니다.")

        records: list[dict] = []
        for one in raw:
            if not isinstance(one, dict):
                fail(f"{key} 항목은 객체여야 합니다.")
            record = {
                name: str(one.get(name) or "").strip()[:max_length]
                for name, max_length in RECORD_KEYS[key]
            }
            if key == "careers":
                items = one.get("items") or []
                if not isinstance(items, list):
                    fail("careers 의 items 는 배열이어야 합니다.")
                record["items"] = [str(item).strip()[:300] for item in items if str(item).strip()]
            # 전부 비어 있는 행은 저장하지 않는다 — 관리자가 추가만 하고 채우지 않은 칸
            if any(v for k, v in record.items() if k != "items") or record.get("items"):
                records.append(record)
        return records

    @staticmethod
    def _link_images(links: Any) -> set[str]:
        """links 안에서 실제로 쓰이는 아이콘 이미지 경로 모음"""
        if not isinstance(links, list):
            return set()
        return {
            link[LINK_IMAGE_KEY]
            for link in links
            if isinstance(link, dict) and link.get(LINK_IMAGE_KEY)
        }


    # ── Tech Stack ───────────────────────────────────────────

    async def get_stack(self) -> list[dict]:
        rows = await self.portfolio_repo.list_stack_categories()
        return [
            {"id": row.id, "name": row.name or "", "items": row.items or []}
            for row in rows
        ]

    async def update_stack(self, request: Request) -> list[dict]:
        body = await self._read_json(request)
        raw = body.get("categories")
        if not isinstance(raw, list):
            fail("categories 는 배열이어야 합니다.")

        rows = []
        for item in raw:
            if not isinstance(item, dict):
                fail("categories 항목은 객체여야 합니다.")

            name = str(item.get("name") or "").strip()
            if not name:
                continue  # 이름 없는 카테고리는 버린다
            if len(name) > 50:
                fail("카테고리 이름은 50자를 넘을 수 없습니다.")

            rows.append(
                {
                    "id": self._optional_id(item.get("id")),
                    "name": name,
                    "items": self._stack_items(item.get("items")),
                }
            )

        # 목록에서 빠진 아이콘 파일을 정리한다
        before = self._stack_images(await self.portfolio_repo.list_stack_categories())
        saved = await self.portfolio_repo.replace_stack_categories(rows)
        for path in before - self._stack_images(saved):
            media.delete_media(path)

        return [
            {"id": row.id, "name": row.name or "", "items": row.items or []}
            for row in saved
        ]

    # ── Approach ─────────────────────────────────────────────

    async def get_approaches(self) -> list[dict]:
        rows = await self.portfolio_repo.list_approaches()
        return [
            {
                "id": row.id,
                "icon": row.icon or "",
                "title": row.title or "",
                "description": row.description or "",
            }
            for row in rows
        ]

    async def update_approaches(self, request: Request) -> list[dict]:
        body = await self._read_json(request)
        raw = body.get("approaches")
        if not isinstance(raw, list):
            fail("approaches 는 배열이어야 합니다.")

        if len(raw) > APPROACH_MAX:
            fail(f"Approach 는 최대 {APPROACH_MAX}개까지 등록할 수 있습니다.")

        rows = []
        for item in raw:
            if not isinstance(item, dict):
                fail("approaches 항목은 객체여야 합니다.")

            title = str(item.get("title") or "").strip()
            if not title:
                continue  # 제목 없는 카드는 버린다

            rows.append(
                {
                    "id": self._optional_id(item.get("id")),
                    "icon": str(item.get("icon") or "").strip()[:50],
                    "title": title[:100],
                    "description": str(item.get("description") or "").strip()[:1000],
                }
            )

        saved = await self.portfolio_repo.replace_approaches(rows)
        return [
            {
                "id": row.id,
                "icon": row.icon or "",
                "title": row.title or "",
                "description": row.description or "",
            }
            for row in saved
        ]

    # ── 목록형 섹션 내부 헬퍼 ────────────────────────────────

    @staticmethod
    def _optional_id(value: Any) -> int | None:
        """새 항목은 id 가 없다. 숫자로 안 읽히면 새 항목으로 본다."""
        try:
            row_id = int(value)
        except (TypeError, ValueError):
            return None
        return row_id if row_id > 0 else None

    @staticmethod
    def _stack_items(raw: Any) -> list[dict]:
        if raw is None:
            return []
        if not isinstance(raw, list):
            fail("items 는 배열이어야 합니다.")

        items = []
        for one in raw:
            if not isinstance(one, dict):
                fail("items 항목은 객체여야 합니다.")

            name = str(one.get("name") or "").strip()
            if not name:
                continue

            icon_image = (one.get("icon_image") or "").strip() or None
            if icon_image and not media.is_media_path(icon_image):
                fail("잘못된 아이콘 이미지 경로입니다.")

            items.append({"name": name[:50], "icon_image": icon_image})
        return items

    @staticmethod
    def _stack_images(rows) -> set[str]:
        """카테고리 목록 안에서 실제로 쓰이는 아이콘 경로 모음"""
        paths: set[str] = set()
        for row in rows:
            for item in row.items or []:
                if isinstance(item, dict) and item.get("icon_image"):
                    paths.add(item["icon_image"])
        return paths


    # ── Projects ─────────────────────────────────────────────

    async def get_projects(self, include_hidden: bool = False) -> list[dict]:
        """공개 화면은 켜진 것만, 관리자 화면은 전부"""
        rows = await self.portfolio_repo.list_projects(visible_only=not include_hidden)
        return [self._project_to_dict(row) for row in rows]

    async def save_project(self, request: Request) -> dict:
        """id 가 있으면 수정, 없으면 추가. body 는 프로젝트 필드 전체."""
        body = await self._read_json(request)

        fields: dict[str, Any] = {}
        for key, max_length in PROJECT_TEXT_FIELDS.items():
            fields[key] = self._text(body, key, max_length)
        if not fields["name"]:
            fail("프로젝트 이름은 비울 수 없습니다.")

        fields["description"] = self._text(body, "description", 5000)
        fields["url"] = self._text(body, "url", 255) or None

        fields["start_date"] = self._date(body, "start_date")
        fields["end_date"] = self._date(body, "end_date")
        if (
            fields["start_date"]
            and fields["end_date"]
            and fields["end_date"] < fields["start_date"]
        ):
            fail("종료일이 시작일보다 앞설 수 없습니다.")

        for key, max_length in PROJECT_LIST_FIELDS.items():
            fields[key] = self._string_list(body.get(key), key, max_length)
        for key in PROJECT_POINT_FIELDS:
            fields[key] = self._point_list(body.get(key), key)

        fields["visible"] = self._bool(body.get("visible"), default=True)

        project_id = self._optional_id(body.get("id"))
        if project_id is None:
            project = await self.portfolio_repo.create_project(fields)
            return self._project_to_dict(project)

        project = await self.portfolio_repo.get_project(project_id)
        if project is None:
            fail("프로젝트를 찾을 수 없습니다.", status_code=404)

        project = await self.portfolio_repo.update_project(project, fields)

        return self._project_to_dict(project)

    async def delete_project(self, request: Request) -> dict:
        """body: {"id": 1}"""
        body = await self._read_json(request)
        project_id = self._optional_id(body.get("id"))
        if project_id is None:
            fail("삭제할 프로젝트 id 가 없습니다.")

        project = await self.portfolio_repo.get_project(project_id)
        if project is None:
            fail("프로젝트를 찾을 수 없습니다.", status_code=404)

        await self.portfolio_repo.delete_project(project)

        return {"id": project_id}

    # ── Projects 내부 헬퍼 ───────────────────────────────────

    @classmethod
    def _project_to_dict(cls, project: PortfolioProject) -> dict:
        return {
            "id": project.id,
            "name": project.name or "",
            "kind": project.kind or "",
            "category": project.category or "",
            "status": project.status or "",
            "start_date": project.start_date.isoformat() if project.start_date else None,
            "end_date": project.end_date.isoformat() if project.end_date else None,
            "role": project.role or "",
            "team": project.team or "",
            "summary": project.summary or "",
            "description": project.description or "",
            "url": project.url,
            "tech_stack": project.tech_stack or [],
            "tags": project.tags or [],
            "integrations": project.integrations or [],
            "highlights": cls._points(project.highlights),
            "features": cls._points(project.features),
            "improvements": cls._points(project.improvements),
            "visible": bool(project.visible),
        }

    @staticmethod
    def _bool(value: Any, default: bool) -> bool:
        if value is None:
            return default
        if isinstance(value, bool):
            return value
        fail("visible 은 true / false 여야 합니다.")

    @staticmethod
    def _date(body: dict, key: str) -> date | None:
        """"YYYY-MM-DD" 문자열. 비어 있으면 None (진행 중)"""
        value = body.get(key)
        if value is None or value == "":
            return None
        if not isinstance(value, str):
            fail(f"{key} 는 YYYY-MM-DD 문자열이어야 합니다.")
        try:
            return date.fromisoformat(value.strip()[:10])
        except ValueError:
            fail(f"{key} 는 YYYY-MM-DD 형식이어야 합니다.")

    @staticmethod
    def _string_list(raw: Any, key: str, max_length: int) -> list[str]:
        if raw is None:
            return []
        if not isinstance(raw, list):
            fail(f"{key} 는 배열이어야 합니다.")

        items: list[str] = []
        for one in raw:
            if not isinstance(one, str):
                fail(f"{key} 항목은 문자열이어야 합니다.")
            text = one.strip()
            if text:
                items.append(text[:max_length])
        return items

    @staticmethod
    def _points(raw: Any) -> list[dict]:
        """저장된 값을 화면이 기대하는 {title, body} 목록으로. 예전 문자열 항목은 설명만 있는 항목으로 읽는다"""
        items: list[dict] = []
        for one in raw or []:
            if isinstance(one, dict):
                title = str(one.get("title") or "").strip()
                body = str(one.get("body") or "").strip()
            else:
                title, body = "", str(one or "").strip()
            if title or body:
                items.append({"title": title, "body": body})
        return items

    @classmethod
    def _point_list(cls, raw: Any, key: str) -> list[dict]:
        if raw is None:
            return []
        if not isinstance(raw, list):
            fail(f"{key} 는 배열이어야 합니다.")
        items: list[dict] = []
        for one in raw:
            if isinstance(one, str):
                one = {"title": "", "body": one}
            if not isinstance(one, dict):
                fail(f"{key} 항목은 제목과 설명이어야 합니다.")
            title = str(one.get("title") or "").strip()[:POINT_TITLE_MAX]
            body = str(one.get("body") or "").strip()[:POINT_BODY_MAX]
            if title or body:
                items.append({"title": title, "body": body})
        return items

