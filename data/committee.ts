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
  { name: "Your Name", role: "President", course: "Course, Year" },
  { name: "Your Name", role: "Vice-President", course: "Course, Year" },
  { name: "Your Name", role: "Treasurer", course: "Course, Year" },
  { name: "Your Name", role: "Events Lead", course: "Course, Year" },
  { name: "Your Name", role: "Sponsorship Lead", course: "Course, Year" },
  { name: "Your Name", role: "Marketing Lead", course: "Course, Year" },
];
