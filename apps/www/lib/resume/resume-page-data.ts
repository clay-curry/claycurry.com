import { profileData } from "@/lib/portfolio-data";

export type ResumeSocialIcon =
  | "location"
  | "email"
  | "x"
  | "github"
  | "linkedin";

export interface ResumeSocialLink {
  icon: ResumeSocialIcon;
  href: string;
  label: string;
  clickId: string;
}

export interface ResumeHeaderData {
  name: string;
  title: string;
  socialLinks: ResumeSocialLink[];
}

export interface ResumeOrganizationData {
  location: string;
  text?: string;
  prefix?: string;
  link?: {
    label: string;
    href: string;
  };
}

export interface ResumeExperienceItem {
  id: string;
  clickId: string;
  title: string;
  date: string;
  organization: ResumeOrganizationData;
  bullets: string[];
}

export interface ResumeEducationRole {
  key: string;
  role: string;
  advisorName: string;
  advisorHref: string;
}

export interface ResumeEducationItem {
  id: string;
  clickId: string;
  title: string;
  date: string;
  minor: string;
  roles: ResumeEducationRole[];
}

export interface ResumeAchievementItem {
  id: string;
  clickId: string;
  title: string;
  date: string;
  issuedBy: string;
  description: string[];
  legacyProgramLink?: {
    label: string;
    href: string;
  };
  verifyLink?: {
    label: string;
    href: string;
  };
}

export const resumeHeaderData: ResumeHeaderData = {
  name: "Clay Curry",
  title: "Product Engineer",
  socialLinks: [
    {
      icon: "location",
      href: "https://www.google.com/maps/place/San+Francisco,+CA",
      label: "Location",
      clickId: "resume:location",
    },
    {
      icon: "email",
      href: `mailto:${profileData.email}`,
      label: "Email",
      clickId: "resume:email",
    },
    {
      icon: "x",
      href: profileData.social.x,
      label: "X",
      clickId: "resume:x",
    },
    {
      icon: "github",
      href: profileData.social.github,
      label: "GitHub",
      clickId: "resume:github",
    },
    {
      icon: "linkedin",
      href: profileData.social.linkedin,
      label: "LinkedIn",
      clickId: "resume:linkedin",
    },
  ],
};

export const resumeSummaryPoints = [
  "I am a product engineer comfortable working anywhere in the stack.",
  "Looking to join early-to-mid stage startup or any team with rapidly-growing users.",
];

export const resumeExperienceItems: ResumeExperienceItem[] = [
  {
    id: "item-1",
    clickId: "resume:accordion:experience-1",
    title: "Amazon.com. Software Dev Engineer.",
    date: "1 year, 2 months",
    organization: {
      prefix: "Core Shopping → Product Detail Page → ",
      link: {
        label: "BuyBox",
        href: "https://www.helium10.com/blog/what-is-the-amazon-buy-box/",
      },
      location: "Seattle, WA",
    },
    bullets: [
      "Shipped 2 plugins consumed by amazon.com's real-time offer recommendation engine, handling billions of requests per day.",
      "Launched a used-book offer recommendation feature driving $30.2MM in revenue growth and 9.7MM additional annualized units sold.",
      'Expanded the "Join Prime" accordion button to 24 countries, producing 5 additional service and business metrics.',
      "Participated in a 24x7 engineering on-call rotation to ensure service uptime and subject matter expert availability.",
    ],
  },
  {
    id: "item-2",
    clickId: "resume:accordion:experience-3",
    title: "University of Oklahoma. Computer Vision Research Assistant.",
    date: "1 year, 2 months",
    organization: {
      text: "Department of Computer Science",
      location: "Norman, OK",
    },
    bullets: [
      "Provisioned 12 workstations for GPU-accelerated deep learning research, improving model training times by 80%.",
      "Scraped and preprocessed 90GB+ of FAA aircraft transponder data collected by crowdsourced receivers.",
      "Trained and evaluated multiple machine learning models (Random Forest, CNN, LSTM) to classify aircraft trajectories with 92% accuracy.",
    ],
  },
  {
    id: "item-3",
    clickId: "resume:accordion:experience-2",
    title: "University of Oklahoma. Linux System Administrator.",
    date: "2 years, 10 months",
    organization: {
      text: "Department of Physics",
      location: "Norman, OK",
    },
    bullets: [
      "Securely administered 150+ Linux lab workstations and servers used by 2,000+ students and faculty members.",
      "Reduced system downtime by 18% by implementing automated monitoring and alerting for critical services.",
      "Saved 4 weeks of annual IT operational effort by streamlining inventory-taking procedures using background jobs.",
      "Ported legacy department website content to modern content management software, leveraging Python to automate the transfer of 120 pages of structured data.",
    ],
  },
];

export const resumeEducationItems: ResumeEducationItem[] = [
  {
    id: "edu-1",
    clickId: "resume:accordion:education-1",
    title: "University of Oklahoma. Computer Science, B.S.",
    date: "Dec 2023",
    minor: "Mathematics minor.",
    roles: [
      {
        key: "acm",
        role: "President — Association for Computing Machinery (ACM), Oklahoma Student Chapter, Chair.",
        advisorName: "Rafal Jabrzemski",
        advisorHref: "https://www.linkedin.com/in/rafal-jabrzemski-0546464/",
      },
      {
        key: "awc",
        role: "Treasurer — Association for Women in Computing (Student Chapter).",
        advisorName: "Sridhar Radhakrishnan",
        advisorHref:
          "https://www.linkedin.com/in/sridhar-radhakrishnan-b3591817/",
      },
    ],
  },
];

export const resumeAchievementItems: ResumeAchievementItem[] = [
  {
    id: "award-1",
    clickId: "resume:accordion:award-1",
    title: "Oklahoma Rising Scholars – Award",
    date: "May 2017",
    issuedBy: "Oklahoma State Regents for Higher Education",
    description: [
      "Oklahoma students automatically qualify for this award by scoring at or above the 99.5 percentile (>34 / 36) on the ACT college-readiness exam.",
    ],
    legacyProgramLink: {
      label: "Academic Scholars Program",
      href: "https://secure.okcollegestart.org/Financial_Aid_Planning/Scholarships/Academic_Scholarships/Academic_Scholars_Program.aspx",
    },
  },
  {
    id: "cert-1",
    clickId: "resume:accordion:cert-1",
    title: "AWS Solutions Architect – Professional",
    date: "Nov 2025",
    issuedBy: "Amazon Web Services (AWS) Training and Certification",
    description: [
      "Validates advanced technical skills and experience in designing distributed systems and applications on the AWS platform, including complex networking, multi-account strategies, cost optimization, and migration planning.",
    ],
    verifyLink: {
      label: "Verify on Credly",
      href: "https://www.credly.com/badges/c4d07372-5471-409a-a842-950f6b94dab4/public_url",
    },
  },
];
