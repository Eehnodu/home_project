// 역할: 헤더형에서 프로젝트 카드를 누르면 여는 상세 모달. 본문은 사이드바형 펼침과 같은 ProjectDetail 을 쓴다

import FormModal from "@/component/client/ui/feedback/formModal";
import ProjectDetail from "@/component/client/portfolio/projectDetail";
import { formatPeriod } from "@/utils/format/date";
import type { PortfolioProject } from "@/types/portfolio";

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: PortfolioProject | null;
}

const ProjectModal = ({ open, onClose, project }: ProjectModalProps) => {
  if (!project) return null;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      headerType="left"
      title={project.name}
      description={formatPeriod(project.start_date, project.end_date)}
      size="lg"
      className="!max-w-3xl"
      footerType={0}
    >
      <div className="py-2">
        <ProjectDetail project={project} />
      </div>
    </FormModal>
  );
};

export default ProjectModal;
