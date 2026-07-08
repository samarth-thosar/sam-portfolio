// Single source of truth for every outbound link on the site.
// Pulled from Samarth's CV. Update the Google Scholar URL once confirmed.

export const profile = {
  name: 'Samarth Shekhar Thosar',
  shortName: 'Samarth Thosar',
  role: 'AI & Full-Stack Engineer',
  jersey: 8,
  tagline: 'I find the signal in the noise.',
  location: 'Pune, India',
}

export const links = {
  email: 'mailto:samarth.thosar194@gmail.com',
  emailPlain: 'samarth.thosar194@gmail.com',
  phone: 'tel:+917887911070',
  phonePlain: '+91 78879 11070',
  linkedin: 'https://www.linkedin.com/in/samarth-thosar',
  github: 'https://github.com/samarth-thosar',
  // TODO: replace with the exact Google Scholar profile URL when Samarth confirms it.
  scholar: 'https://scholar.google.com/',
  cv: '/CV_for_ML_related_job.pdf',
}

export const publications = [
  {
    title:
      'Deepfake Detection for Preventing Audio and Video Frauds using Advanced Deep Learning Techniques',
    venue: 'IEEE ICIICIS 2023 · Scopus-indexed',
    doi: 'https://doi.org/10.1109/ICAICCIT60255.2023.10465762',
  },
  {
    title:
      'Battlefield Health Surveillance with Soldier Tracking: A Privacy-Preserving Encrypted Approach',
    venue: 'IEEE ICAICCIT 2023 · Scopus-indexed',
    doi: 'https://doi.org/10.1109/ICIICS59993.2023.10421486',
  },
]

// Social links surfaced as an icon row in the hero + footer.
export const socials = [
  { label: 'GitHub', href: links.github },
  { label: 'LinkedIn', href: links.linkedin },
  { label: 'Scholar', href: links.scholar },
  { label: 'Email', href: links.email },
]
