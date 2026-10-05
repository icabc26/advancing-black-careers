/**
 * Committee — EDIT THIS LIST.
 * To add a photo, drop the image in /public/committee and set
 * `photo: "/committee/your-file.jpg"`; until then a gold-glow placeholder shows.
 */
export type CommitteeMember = {
  name: string;
  role: string;
  course?: string;
  photo?: string;
};

export const committee: CommitteeMember[] = [
  { name: "Rola Makoyawo", role: "Chair", course: "Material Science and Engineering, 3rd Year", photo: "/committee/Rola.jpg" },
  { name: "Tomi Fabamigbe", role: "Vice-Chair", course: "Chemical Engineering, 3rd Year", photo: "/committee/Tomi.jpg" },
  { name: "Dami Omorodion-Banjo", role: "Treasurer", course: "Electrical & Electronic Engineering, 3rd Year", photo: "/committee/Dami.jpg" },
  { name: "Clifford Boakye-Saunders", role: "Secretary", course: "Medicine, 2nd Year", photo: "/committee/Clifford.jpg" },
  { name: "Nathan Olotu", role: "Sponsorship Lead", course: "Mechanical Engineering, 2nd Year", photo: "/committee/Nathan.jpg" },
  { name: "Moses Odigbo", role: "Sponsorship Lead", course: "Chemical Engineering, 2nd Year", photo: "/committee/Moses.jpg" },
  { name: "Joshlynn Owusu", role: "Marketing Lead", course: "Chemistry, 2nd Year", photo: "/committee/Joshlynn.jpg" },
  { name: "Elijah Thomas-Williams", role: "Finance Lead", course: "Material Science and Engineering, 3rd Year", photo: "/committee/Elijah.jpg" },
  { name: "Fola Otulana", role: "Finance Lead", course: "Maths, 3rd Year" },
  { name: "Ikaheng Pagiwa", role: "Finance Lead", course: "Chemistry, 3rd Year", photo: "/committee/Ikaheng.jpg" },
  { name: "Chude Ndozi", role: "Tech Lead", course: "Computing, 3rd Year", photo: "/committee/Chude.jpg" },
  { name: "Collins Olafusi", role: "Tech Lead", course: "Computing, 2nd Year", photo: "/committee/Collins.jpg" },
  { name: "Shayne Chibundu", role: "Consulting Lead", course: "Aerospace Engineering, 3rd Year", photo: "/committee/Shayne.jpg" },
  { name: "Seyi Opaleye", role: "Alternative Industries Lead", course: "Biochemistry with French, 2nd Year", photo: "/committee/Seyi.jpg" },
];
