import { Link } from 'react-router-dom';

const strengths = [
  'Explained complex technical concepts with clarity and structure.',
  'Connected academic experience, cybersecurity projects, and technology risk consulting.',
  'Demonstrated practical experience across networking, compliance, and software projects.',
  'Addressed privacy, testing, human review, and monitoring in an automation plan.',
];

const improvements = [
  'Discuss PostgreSQL constraints, transactions, and database-level integrity.',
  'Explain authentication and authorization, such as JWT, OAuth, or RBAC.',
  'Describe how ORM queries protect against SQL injection.',
  'Make the security impact of network segmentation explicit, including limiting lateral movement.',
];

const answers = [
  {
    number: '01',
    section: 'Introduction and Resume Overview',
    question:
      'Can you briefly introduce yourself and highlight how your background in Electronics & Telecommunication aligns with a career in technology consulting?',
    excerpt:
      'The candidate connected an Electronics and Telecommunication background with networking, cybersecurity projects, risk and compliance work, and an interest in technology consulting.',
    score: 5,
    feedback:
      'The evaluation praised the academic introduction, relevant projects, and connection to technology consulting. It suggested maintaining the same structure in technical deep-dive answers.',
    strengths: [
      'Clear introduction of academic background.',
      'Relevant projects and practical experience.',
      'A thoughtful connection between technology and risk consulting.',
    ],
    improvements: [],
  },
  {
    number: '02',
    section: 'Projects and Practical Experience',
    question:
      'You built an AI Interview Platform using FastAPI and PostgreSQL. How did you handle data integrity and security within your database schema?',
    excerpt:
      'The answer described an interview lifecycle, session identifiers connecting records, schema validation, and input limits to prevent resource abuse.',
    score: 7,
    feedback:
      'The evaluation recognized application-level validation and lifecycle management. It suggested explaining database constraints, authentication and authorization, SQL injection prevention, and transactions.',
    strengths: [
      'Used lifecycle states to manage interview sessions.',
      'Recognized input validation as protection against resource exhaustion.',
      'Connected related records through session identifiers.',
    ],
    improvements: [
      'Name PostgreSQL constraints such as foreign keys, NOT NULL, and UNIQUE.',
      'Explain authentication and authorization controls.',
      'Describe parameterized queries and transaction handling.',
    ],
  },
  {
    number: '03',
    section: 'Technical Concepts and Job Skills',
    question:
      'In your network simulation project, you used VLANs. Can you explain why VLANs are important for network security in a corporate environment?',
    excerpt:
      'The answer covered departmental separation, easier network growth, access-control lists, and keeping broadcast traffic within its domain.',
    score: 8,
    feedback:
      'The evaluation recognized practical understanding of logical segmentation, scalability, broadcast-domain isolation, and ACLs. It suggested explicitly discussing attack-surface reduction and limiting lateral movement.',
    strengths: [
      'Explained logical segmentation by department.',
      'Connected VLANs with scalability and operational efficiency.',
      'Recognized broadcast-domain isolation and ACLs.',
    ],
    improvements: [
      'Explain how segmentation can contain a compromise and limit lateral movement.',
    ],
  },
  {
    number: '04',
    section: 'Behavioural and Problem-Solving',
    question:
      'If you were tasked with automating a repetitive manual task for a client, what steps would you take to ensure the solution is reliable and compliant?',
    excerpt:
      'The answer outlined understanding the process, documenting requirements, choosing suitable tools, reviewing PII risks, testing edge cases, human review, and monitoring.',
    score: 5,
    feedback:
      'The evaluation praised the structured lifecycle, privacy awareness, testing, human-in-the-loop validation, and monitoring. It suggested adding version control and CI/CD practices.',
    strengths: [
      'Started with requirements and process understanding.',
      'Considered PII and compliance risks.',
      'Included testing, human review, and operational monitoring.',
    ],
    improvements: [
      'Include version control and CI/CD in the reliability plan.',
    ],
  },
];

export default function SampleReportPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 pb-20 pt-28 sm:px-8">
      <Link className="text-link text-sm" to="/">← Back to AiiN</Link>

      <header className="mt-7 border-b border-border pb-8">
        <p className="eyebrow text-text-muted">Sample interview report</p>
        <h1 className="editorial mt-3 text-5xl sm:text-6xl">Session summary</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Monday, 12 October 2026 at 23:49 · 10 minutes · 4 answers
        </p>
        <p className="mt-2 text-xs text-text-muted">
          Example from an earlier evaluation format. Per-answer scores are shown as recorded;
          their maximum was not stored, so they are not percentages.
        </p>
      </header>

      <section className="grid gap-8 border-b border-border py-8 sm:grid-cols-[0.7fr_1.3fr] sm:items-center">
        <div>
          <p className="eyebrow text-text-muted">Overall score · legacy AI estimate</p>
          <p className="editorial mt-2 text-7xl">
            88<span className="ml-2 text-2xl text-text-muted">/100</span>
          </p>
        </div>
        <div>
          <p className="eyebrow text-text-muted">Summary</p>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            The candidate demonstrated strong technical competence and professional maturity,
            connecting academic experience with practical projects in networking, cybersecurity,
            and risk consulting. Communication was clear and structured. The report identified
            database security and API authentication as areas for further development.
          </p>
          <p className="mt-4 text-sm">
            <span className="text-text-muted">Recommendation: </span>
            Strong Hire
          </p>
        </div>
      </section>

      <section className="grid gap-8 border-b border-border py-8 sm:grid-cols-2">
        <div>
          <p className="eyebrow text-text-muted">Strengths</p>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {strengths.map((strength) => (
              <li className="border-t border-border pt-2" key={strength}>{strength}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-text-muted">Areas to improve</p>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {improvements.map((improvement) => (
              <li className="border-t border-border pt-2" key={improvement}>{improvement}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-8">
        <p className="eyebrow text-text-muted">Questions and feedback</p>
        <ol className="mt-4 divide-y divide-border border-y border-border">
          {answers.map((answer) => (
            <li className="py-6" key={answer.number}>
              <p className="mono text-text-muted">QUESTION {answer.number} · {answer.section}</p>
              <h2 className="editorial mt-3 text-3xl">{answer.question}</h2>
              <div className="mt-5">
                <p className="eyebrow text-text-muted">Answer overview</p>
                <p className="mt-2 text-sm leading-7 text-text-secondary">{answer.excerpt}</p>
              </div>
              <details className="mt-5 border-t border-border pt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  View evaluation · legacy score {answer.score}
                </summary>
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-7 text-text-secondary">{answer.feedback}</p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="eyebrow text-text-muted">Strengths</p>
                      <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                        {answer.strengths.map((strength) => (
                          <li key={strength}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    {answer.improvements.length > 0 && (
                      <div>
                        <p className="eyebrow text-text-muted">Areas to improve</p>
                        <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                          {answer.improvements.map((improvement) => (
                            <li key={improvement}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>

      <div className="border-t border-border pt-7">
        <Link className="primary-action" to="/register">Start an interview</Link>
      </div>
    </main>
  );
}
