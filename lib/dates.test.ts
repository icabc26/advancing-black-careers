import { afterEach, describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  addDays,
  addMonths,
  daysInMonth,
  formatAccessibleName,
  formatDisplay,
  formatIso,
  formatMonthHeading,
  monthGrid,
  parseIso,
  todayLocal,
  weekdayMon0,
  yearOptions,
  type CalDate,
  type YearMonth,
} from "@/lib/dates";

// Shared generators. Any valid calendar day from 1900-01-01 to 2100-12-31,
// including 29 February in leap years.
const arbCalDate: fc.Arbitrary<CalDate> = fc
  .record({
    y: fc.integer({ min: 1900, max: 2100 }),
    m: fc.integer({ min: 1, max: 12 }),
  })
  .chain(({ y, m }) =>
    fc.integer({ min: 1, max: daysInMonth(y, m) }).map((d) => ({ y, m, d })),
  );

describe("ISO round trip", () => {
  // Feature: tracker-date-picker, Property 1: ISO round trip
  // **Validates: Requirements 5.2, 5.3, 5.5**
  it("formatIso produces a 10-char YYYY-MM-DD that parseIso reads back", () => {
    fc.assert(
      fc.property(arbCalDate, (date) => {
        const iso = formatIso(date);
        expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(iso).toHaveLength(10);
        expect(parseIso(iso)).toEqual(date);
      }),
      { numRuns: 200 },
    );
  });

  // Feature: tracker-date-picker, Property 1: ISO round trip
  // **Validates: Requirements 5.2, 5.3, 5.5**
  it("parseIso rejects whitespace-padded valid dates", () => {
    const arbPad = fc.constantFrom(" ", "\t", "\n", "  ");
    fc.assert(
      fc.property(arbCalDate, arbPad, fc.boolean(), (date, pad, leading) => {
        const iso = formatIso(date);
        expect(parseIso(leading ? pad + iso : iso + pad)).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  // Feature: tracker-date-picker, Property 1: ISO round trip
  // **Validates: Requirements 5.2, 5.3, 5.5**
  it("parseIso rejects out-of-range months and days", () => {
    const arbBad = fc.oneof(
      // Month 00 or 13–99
      fc
        .tuple(
          fc.integer({ min: 1900, max: 2100 }),
          fc.oneof(fc.constant(0), fc.integer({ min: 13, max: 99 })),
          fc.integer({ min: 1, max: 28 }),
        )
        .map(([y, m, d]) => ({ y, m, d })),
      // Day 00 or past the end of the month
      fc
        .record({
          y: fc.integer({ min: 1900, max: 2100 }),
          m: fc.integer({ min: 1, max: 12 }),
        })
        .chain(({ y, m }) =>
          fc
            .oneof(
              fc.constant(0),
              fc.integer({ min: daysInMonth(y, m) + 1, max: 99 }),
            )
            .map((d) => ({ y, m, d })),
        ),
    );
    fc.assert(
      fc.property(arbBad, (date) => {
        expect(parseIso(formatIso(date))).toBeNull();
      }),
      { numRuns: 200 },
    );
  });

  it.each([
    "",
    "2025-9-2",
    "25-09-02",
    "2025/09/02",
    "20250902",
    "2025-09-02T00:00",
    "2025-13-01",
    "2025-00-10",
    "2025-09-00",
    "2025-02-29",
    "1900-02-29",
    " 2025-09-02",
    "2025-09-02 ",
    "abcd-ef-gh",
  ])("parseIso(%j) returns null", (s) => {
    expect(parseIso(s)).toBeNull();
  });

  it("parses known valid dates", () => {
    expect(parseIso("2025-09-02")).toEqual({ y: 2025, m: 9, d: 2 });
    expect(parseIso("2028-02-29")).toEqual({ y: 2028, m: 2, d: 29 });
    expect(parseIso("2000-02-29")).toEqual({ y: 2000, m: 2, d: 29 });
  });
});

describe("examples", () => {
  it("formatDisplay uses the en-GB short form", () => {
    expect(formatDisplay({ y: 2028, m: 2, d: 29 })).toBe("29 Feb 2028");
    expect(formatDisplay({ y: 2025, m: 9, d: 2 })).toBe("2 Sep 2025");
  });

  it("formatAccessibleName includes the full weekday and month", () => {
    expect(formatAccessibleName({ y: 2025, m: 9, d: 2 })).toBe(
      "Tuesday 2 September 2025",
    );
  });

  it("formatMonthHeading gives the full month and year", () => {
    expect(formatMonthHeading({ y: 2025, m: 9 })).toBe("September 2025");
  });

  it("todayLocal reads the local calendar day just after midnight", () => {
    expect(todayLocal(new Date(2025, 0, 1, 0, 30))).toEqual({
      y: 2025,
      m: 1,
      d: 1,
    });
  });

  it("parseIso reads a valid date and rejects an empty string", () => {
    expect(parseIso("2025-09-02")).toEqual({ y: 2025, m: 9, d: 2 });
    expect(parseIso("")).toBeNull();
  });
});

describe("time-zone independence", () => {
  // 14 zones spanning UTC−12 to UTC+14, including DST and half-hour offsets.
  const ZONES = [
    "Etc/GMT+12",
    "Pacific/Honolulu",
    "America/Los_Angeles",
    "America/New_York",
    "America/Sao_Paulo",
    "UTC",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Kolkata",
    "Asia/Kathmandu",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
    "Pacific/Kiritimati",
  ] as const;

  const MON = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const originalTz = process.env.TZ;

  const setTz = (tz: string | undefined) => {
    if (tz === undefined) delete process.env.TZ;
    else process.env.TZ = tz;
  };

  afterEach(() => setTz(originalTz));

  const outputs = (date: CalDate) => [
    formatIso(date),
    formatDisplay(date),
    formatAccessibleName(date),
  ];

  it("switching process.env.TZ in-process changes the local offset", () => {
    setTz("Pacific/Kiritimati");
    const east = new Date(0).getTimezoneOffset();
    setTz("Etc/GMT+12");
    const west = new Date(0).getTimezoneOffset();
    expect(east).not.toBe(west);
  });

  // Feature: tracker-date-picker, Property 2: Time-zone independence
  // **Validates: Requirements 5.1, 5.4**
  it("formatters give the same output in every zone as under TZ=UTC", () => {
    fc.assert(
      fc.property(arbCalDate, (date) => {
        setTz("UTC");
        const baseline = outputs(date);
        expect(formatDisplay(date)).toBe(`${date.d} ${MON[date.m]} ${date.y}`);

        for (const zone of ZONES) {
          setTz(zone);
          expect(outputs(date)).toEqual(baseline);
          expect(formatDisplay(date)).toBe(
            `${date.d} ${MON[date.m]} ${date.y}`,
          );
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("month grid completeness", () => {
  const arbYearMonth: fc.Arbitrary<YearMonth> = fc.record({
    y: fc.integer({ min: 1900, max: 2100 }),
    m: fc.integer({ min: 1, max: 12 }),
  });

  // Feature: tracker-date-picker, Property 3: Month grid completeness
  // **Validates: Requirements 2.1, 2.5**
  it("monthGrid has 4–6 Monday-first rows with every day once, in its weekday column", () => {
    fc.assert(
      fc.property(arbYearMonth, (ym) => {
        const grid = monthGrid(ym);
        expect(grid.length).toBeGreaterThanOrEqual(4);
        expect(grid.length).toBeLessThanOrEqual(6);
        for (const row of grid) expect(row).toHaveLength(7);

        const flat = grid.flat();
        const days = daysInMonth(ym.y, ym.m);
        const first = flat.findIndex((c) => c !== null);
        const lead = weekdayMon0({ y: ym.y, m: ym.m, d: 1 });

        // Leading nulls only before day 1.
        expect(first).toBe(lead);
        // Days 1..daysInMonth, contiguous and in order, each in its weekday column.
        for (let d = 1; d <= days; d++) {
          const idx = lead + d - 1;
          expect(flat[idx]).toEqual({ y: ym.y, m: ym.m, d });
          expect(idx % 7).toBe(weekdayMon0({ y: ym.y, m: ym.m, d }));
        }
        // Trailing nulls only after the last day.
        const tail = flat.slice(lead + days);
        expect(tail.every((c) => c === null)).toBe(true);
        expect(tail.length).toBeLessThan(7);
        // Exactly daysInMonth non-null cells.
        expect(flat.filter((c) => c !== null)).toHaveLength(days);
      }),
      { numRuns: 300 },
    );
  });
});

describe("month navigation", () => {
  const arbYearMonth: fc.Arbitrary<YearMonth> = fc.record({
    y: fc.integer({ min: 1900, max: 2100 }),
    m: fc.integer({ min: 1, max: 12 }),
  });

  const validMonth = (ym: YearMonth) => {
    expect(Number.isInteger(ym.m)).toBe(true);
    expect(ym.m).toBeGreaterThanOrEqual(1);
    expect(ym.m).toBeLessThanOrEqual(12);
  };

  // Feature: tracker-date-picker, Property 4: Month navigation inverse and rollover
  // **Validates: Requirements 3.1**
  it("addMonths by n then −n returns the starting month", () => {
    fc.assert(
      fc.property(
        arbYearMonth,
        fc.integer({ min: -1200, max: 1200 }),
        (ym, n) => {
          const moved = addMonths(ym, n);
          validMonth(moved);
          expect(addMonths(moved, -n)).toEqual(ym);
        },
      ),
      { numRuns: 300 },
    );
  });

  // Feature: tracker-date-picker, Property 4: Month navigation inverse and rollover
  // **Validates: Requirements 3.1**
  it("addMonths by ±1 rolls the year at December and January", () => {
    fc.assert(
      fc.property(arbYearMonth, (ym) => {
        const next = addMonths(ym, 1);
        const prev = addMonths(ym, -1);
        validMonth(next);
        validMonth(prev);
        expect(next).toEqual(
          ym.m === 12 ? { y: ym.y + 1, m: 1 } : { y: ym.y, m: ym.m + 1 },
        );
        expect(prev).toEqual(
          ym.m === 1 ? { y: ym.y - 1, m: 12 } : { y: ym.y, m: ym.m - 1 },
        );
      }),
      { numRuns: 300 },
    );
  });
});

describe("day navigation", () => {
  // Independent next/previous-day oracles, built from daysInMonth only.
  const nextDay = ({ y, m, d }: CalDate): CalDate => {
    if (d < daysInMonth(y, m)) return { y, m, d: d + 1 };
    if (m < 12) return { y, m: m + 1, d: 1 };
    return { y: y + 1, m: 1, d: 1 };
  };

  const prevDay = ({ y, m, d }: CalDate): CalDate => {
    if (d > 1) return { y, m, d: d - 1 };
    if (m > 1) return { y, m: m - 1, d: daysInMonth(y, m - 1) };
    return { y: y - 1, m: 12, d: 31 };
  };

  // Feature: tracker-date-picker, Property 5: Day navigation inverse and boundary crossing
  // **Validates: Requirements 6.3**
  it("addDays by n then −n returns the starting date", () => {
    fc.assert(
      fc.property(arbCalDate, fc.integer({ min: -400, max: 400 }), (date, n) => {
        expect(addDays(addDays(date, n), -n)).toEqual(date);
      }),
      { numRuns: 300 },
    );
  });

  // Feature: tracker-date-picker, Property 5: Day navigation inverse and boundary crossing
  // **Validates: Requirements 6.3**
  it("addDays by ±1 crosses month and year boundaries", () => {
    fc.assert(
      fc.property(arbCalDate, (date) => {
        expect(addDays(date, 1)).toEqual(nextDay(date));
        expect(addDays(date, -1)).toEqual(prevDay(date));
      }),
      { numRuns: 300 },
    );
  });

  // Feature: tracker-date-picker, Property 5: Day navigation inverse and boundary crossing
  // **Validates: Requirements 6.3**
  it("addDays by 7 equals seven single-day steps", () => {
    fc.assert(
      fc.property(arbCalDate, (date) => {
        let stepped = date;
        for (let i = 0; i < 7; i++) stepped = addDays(stepped, 1);
        expect(addDays(date, 7)).toEqual(stepped);
      }),
      { numRuns: 200 },
    );
  });
});

describe("year options", () => {
  // Feature: tracker-date-picker, Property 6: Year options cover the range and extras
  // **Validates: Requirements 3.2**
  it("yearOptions is strictly ascending and exactly the range plus extras", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1910, max: 2095 }),
        fc.option(fc.integer({ min: 1900, max: 2100 }), { nil: null }),
        fc.integer({ min: 1900, max: 2100 }),
        (currentYear, selectedYear, displayedYear) => {
          const result = yearOptions(currentYear, selectedYear, displayedYear);

          // Strictly ascending, so no duplicates.
          for (let i = 1; i < result.length; i++) {
            expect(result[i]).toBeGreaterThan(result[i - 1]);
          }

          // Independently built expected set.
          const expected: number[] = [];
          for (let y = currentYear - 10; y <= currentYear + 5; y++) {
            expected.push(y);
          }
          expected.push(displayedYear);
          if (selectedYear !== null) expected.push(selectedYear);
          const expectedSet = new Set(expected);

          expect(new Set(result)).toEqual(expectedSet);
          expect(result).toHaveLength(expectedSet.size);
        },
      ),
      { numRuns: 300 },
    );
  });
});
