import { describe, expect, it } from 'vitest';
import { classifyReferrer } from '../referrer';

describe('Referrer & Recruiter Traffic Classifier', () => {
  it('classifies direct visits or empty referrers as Direct / Resume Link', () => {
    expect(classifyReferrer(null).source).toBe('Direct / Resume Link');
    expect(classifyReferrer('').category).toBe('direct');
    expect(classifyReferrer('   ').isRecruiterSource).toBe(false);
  });

  it('detects recruiter and job board traffic with isRecruiterSource: true', () => {
    const linkedin = classifyReferrer('https://www.linkedin.com/in/recruiter-profile');
    expect(linkedin.source).toBe('LinkedIn');
    expect(linkedin.category).toBe('job-board');
    expect(linkedin.isRecruiterSource).toBe(true);

    const greenhouse = classifyReferrer('https://boards.greenhouse.io/company/jobs/123');
    expect(greenhouse.source).toBe('Greenhouse ATS');
    expect(greenhouse.category).toBe('job-board');
    expect(greenhouse.isRecruiterSource).toBe(true);

    const handshake = classifyReferrer('https://app.joinhandshake.com/stu/jobs');
    expect(handshake.source).toBe('Handshake');
    expect(handshake.isRecruiterSource).toBe(true);
  });

  it('classifies developer and design platforms', () => {
    const github = classifyReferrer('https://github.com/developer');
    expect(github.source).toBe('GitHub');
    expect(github.category).toBe('developer-design');
    expect(github.isRecruiterSource).toBe(false);

    const figma = classifyReferrer('https://www.figma.com/@designer');
    expect(figma.source).toBe('Figma');
    expect(figma.category).toBe('developer-design');
  });

  it('classifies search engines and social platforms', () => {
    const google = classifyReferrer('https://www.google.co.uk/search?q=student+portfolio');
    expect(google.source).toBe('Google Search');
    expect(google.category).toBe('search');

    const twitter = classifyReferrer('https://t.co/xyz123'); // t.co or x.com
    expect(twitter.source).toBe('X / Twitter');
    const x = classifyReferrer('https://x.com/student');
    expect(x.source).toBe('X / Twitter');
    expect(x.category).toBe('social');

    const reddit = classifyReferrer('https://www.reddit.com/r/webdev');
    expect(reddit.source).toBe('Reddit');
    expect(reddit.category).toBe('social');
  });
});
