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
  async getActiveCLWItems(courseBaseKey) {
    // const base = getBase(process.env.AIRTABLE_BASE_COURSES);
    // const coursecBase = await base("courses");
    // const records = await coursecBase
    //   .select({
    //     maxRecords: 1,
    //     filterByFormula: `Name='${course}'`,
    //   })
    // .all();
    // const courseBaseKey = records[0].fields.Base;
    const courseBase = getBase(courseBaseKey);
    const table = await courseBase("GradesFields");
    const recs = await table
      .select({
        maxRecords: 100,
        filterByFormula: `AND(Display='yes')`,
        sort: [{ field: "Order", direction: "asc" }],
      })
      .all();
    const items = recs.map((rec) => {
      return {
        label: rec.fields.Label,
        field: rec.fields.Field,
        category: rec.fields.Category,
      };
    });
    return items;
  },
  async checkStudentCode(student_code, courseBaseKey) {
    try {
      const courseBase = getBase(courseBaseKey);
      const table = await courseBase("Grades");
      const records = await table.find(student_code);
      if (records) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  },
  async getStudentCLW(courseBaseKey, id, items) {
    const courseBase = getBase(courseBaseKey);
    const table = await courseBase("Grades");
    const record = await table.find(id);
    const grades = items.map((item) => {
      const value = Array.isArray(record.fields[item.field])
        ? record.fields[item.field][0]
        : record.fields[item.field];
      return {
        label: item.label,
        category: item.category,
        value:
          item.category === "grade"
            ? isNaN(parseFloat(value))
              ? value
              : Math.round(parseFloat(value) * 100) / 100
            : value,
      };
    });
    return grades;
  },
};
