const getBase = require("./airbase");

module.exports = {
  async getActiveCourses() {
    const base = getBase(process.env.AIRTABLE_BASE_COURSES);
    const courseBase = await base("courses");
    const records = await courseBase
      .select({
        maxRecords: 10,
        filterByFormula: "Status='active'",
      })
      .all();
    const courses = records.map((rec, ind) => {
      return {
        id: ind + 1,
        name: rec.fields.Name,
        base: rec.fields.Base,
      };
    });
    return courses;
  },
  async getActiveCLWItems(course) {
    const base = getBase(process.env.AIRTABLE_BASE_COURSES);
    const coursecBase = await base("courses");
    const records = await coursecBase
      .select({
        maxRecords: 1,
        filterByFormula: `Name='${course}'`,
      })
      .all();
    const courseBaseKey = records[0].fields.Base;
    const courseBase = getBase(courseBaseKey);
    const table = await courseBase("GradesFields");
    const recs = await table
      .select({
        maxRecords: 100,
        filterByFormula: `AND(Display='yes',Category='grade')`,
        sort: [{ field: "Order", direction: "asc" }],
      })
      .all();
    const items = recs.map((rec) => {
      return {
        label: rec.fields.Label,
        field: rec.fields.Field,
      };
    });
    return items;
  },
  async getStudentCLW(courseBaseKey, id, items) {
    const courseBase = getBase(courseBaseKey);
    const table = await courseBase("Grades");
    const recs = await table
      .select({
        maxRecords: 100,
        fields: items.map((it) => it.field),
        filterByFormula: `ID=${id}`,
      })
      .all();
    const grades = items.map((item) => {
      const value = Array.isArray(recs[0].fields[item.field])
        ? recs[0].fields[item.field][0]
        : recs[0].fields[item.field];
      return {
        label: item.label,
        value: Math.round(parseFloat(value) * 100) / 100,
      };
    });
    return grades;
  },
};
