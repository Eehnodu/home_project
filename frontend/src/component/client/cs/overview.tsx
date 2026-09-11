interface CsOverviewProps {
  description: string;
}

const CsOverview = ({ description }: CsOverviewProps) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-txt-sub leading-relaxed whitespace-pre-line">
        {description}
      </p>
      <p className="text-base text-txt-sub">
        위 탭에서 학습할 항목을 선택하세요.
      </p>
    </div>
  );
};

export default CsOverview;
