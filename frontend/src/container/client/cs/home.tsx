// 역할: CS 모아 첫 화면 — 소개와 주제 카드

import {
  GitBranch,
  Cpu,
  Network,
  Monitor,
  Database,
  Layers,
} from "lucide-react";

const topics = [
  {
    icon: GitBranch,
    label: "자료구조",
    desc: "배열, 연결 리스트, 트리, 그래프 등 데이터를 효율적으로 저장하고 다루는 구조를 학습합니다.",
  },
  {
    icon: Cpu,
    label: "알고리즘",
    desc: "정렬, 이진 탐색, DP, 그리디 등 문제를 효율적으로 해결하는 핵심 알고리즘을 다룹니다.",
  },
  {
    icon: Network,
    label: "네트워크",
    desc: "OSI 7계층, TCP/UDP, HTTP, DNS 등 네트워크 통신의 동작 원리를 정리합니다.",
  },
  {
    icon: Monitor,
    label: "운영체제",
    desc: "프로세스, 스레드, CPU 스케줄링, 메모리 관리 등 OS의 핵심 동작 방식을 다룹니다.",
  },
  {
    icon: Database,
    label: "데이터베이스",
    desc: "트랜잭션, 인덱스, 정규화, 조인 등 DB를 올바르게 이해하고 설계하기 위한 개념을 정리합니다.",
  },
  {
    icon: Layers,
    label: "디자인 패턴",
    desc: "SOLID 원칙과 생성·구조·행위 패턴을 통해 유지보수 가능한 설계 방법을 학습합니다.",
  },
];

const CsHome = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* 인트로 */}
      <div className="flex flex-col gap-2 pb-6 border-b border-line">
        <p className="text-base text-txt-sub leading-relaxed">
          단순히 외우는 것이 아닌, 왜 그렇게 동작하는지를 이해하는 것을 목표로
          정리한 공간입니다.
          <br />
          자료구조와 알고리즘부터 네트워크, 운영체제, 데이터베이스, 디자인
          패턴까지 —
          <br />
          CS 핵심 개념을 주제별로 체계적으로 다룹니다.
          <br />
          왼쪽 사이드바에서 원하는 주제를 선택해 시작하세요.
        </p>
      </div>

      {/* 주제 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topics.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex flex-col gap-3 px-6 py-5 rounded-2xl border border-line"
          >
            <Icon className="w-4 h-4 text-txt-sub" />
            <div className="flex flex-col gap-1.5">
              <p className="font-bold text-txt-main text-base">{label}</p>
              <p className="text-sm text-txt-sub leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CsHome;
