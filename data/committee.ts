/**
 * Committee — EDIT THIS LIST.
 * These are clearly-marked placeholders. Replace names, roles and courses with
 * your real committee. To add a photo, drop the image in /public and set
 * `photo: "/committee/your-file.jpg"`; until then a gold-glow placeholder shows.
 */
export type CommitteeMember = {
  name: string;
  role: string;
  course?: string;
  photo?: string;
};

export const committee: CommitteeMember[] = [
  { name: "Rola Makoyawo", role: "Chair", course: "Material Science and Engineering, 2nd Year" },
  { name: "Tomi Fabamigbe", role: "Vice-Chair", course: "Chemical Engineering, 2nd Year" },
  { name: "Dami Omorodion-Banjo", role: "Treasurer", course: "Electrical & Electronic Engineering, 2nd Year" },
  { name: "Elijah Thomas-Williams", role: "Finance Lead", course: "Material Science and Engineering, 2nd Year" },
  { name: "Fola Otulana", role: "Finance Lead", course: "Maths, 2nd Year" },
  { name: "Ikaheng Pagiwa", role: "Finance Lead", course: "Chemistry, 2nd Year" },
  { name: "Chude Ndozi", role: "Tech Lead", course: "Computing, 2nd Year" },
  { name: "Collins Olafusi", role: "Tech Lead", course: "COmputing, 1st Year" },
  { name: "Shayne Chibundu", role: "Consulting Lead", course: "Aerospace Engineering, 2nd Year" },
];
