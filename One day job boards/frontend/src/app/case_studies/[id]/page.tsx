import caseData from "@/data/case_studies.json";

export default function CaseStudyDetails({ params }: { params: { id: string } }) {
  const study = caseData.caseStudies.find((s) => s.id === params.id);

  if (!study)
    return <p className="text-white text-center mt-20">Case study not found.</p>;

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-36 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold">{study.title}</h1>

      <img
        src={study.image}
        alt={study.title}
        className="w-full h-72 object-cover rounded-xl mt-6"
      />

      <div className="mt-8 space-y-4">
        <p>
          <span className="font-bold">Category:</span> {study.category}
        </p>
        <p>
          <span className="font-bold">Difficulty:</span> {study.difficultyLevel}
        </p>
        <p>
          <span className="font-bold">Estimated Time:</span>{" "}
          {study.timeToDeliver} minutes
        </p>

        <p>
          <span className="font-bold">Problem:</span> {study.problem}
        </p>

        <p>
          <span className="font-bold">Solution:</span> {study.solution}
        </p>

        <div>
          <span className="font-bold">Tags: </span>
          {study.tags.map((t) => (
            <span
              key={t}
              className="inline-block bg-gray-800 px-2 py-1 text-xs rounded mr-2"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
