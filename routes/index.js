var express = require("express");
var router = express.Router();
const getBase = require("../util/airbase");
const {
  getActiveCourses,
  getActiveCLWItems,
  getStudentCLW,
} = require("../util/classwork");

/* GET home page. */
router.get("/", async function (_req, res, next) {
  const courses = await getActiveCourses();
  res.render("index", {
    title: "Classwork Page",
    courses,
  });
});

/* GET home page. */
router.post("/classwork", async function (req, res, next) {
  const courses = await getActiveCourses();
  const course = req.body.courseName;
  const student_id = req.body.studentID;
  if (!course || !student_id) {
    res.send(`
      <div class="alert alert-danger" role="alert">
      Please provide your code and choose your course.
      </div>
      `);
  } else {
    try {
      const courseBaseKey = courses.filter((crs) => crs.name === course)[0];
      const items = await getActiveCLWItems(course);
      if (!items || items.length === 0) {
        res.send(`
      <div class="alert alert-info" role="alert">
      No grades available at this time, please contact me.
      </div>
      `);
      } else {
        const grades = await getStudentCLW(
          courseBaseKey.base,
          student_id,
          items
        );
        if (!grades || grades.length === 0) {
          res.send(`
            <div class="alert alert-info" role="alert">
            No grades available at this time, please contact me.
            </div>
            `);
        } else {
          res.render("grades", { grades });
        }
      }
    } catch (error) {
      res.status(500).send(new Error(error));
    }
  }
});

/* GET home page. */
router.get("/blog", function (_req, res, next) {
  res.send(`<h3>Blog</h3>`);
});

module.exports = router;

// const base = getBase(process.env.AIRTABLE_BASE_T223MATH101);
//   base("Grades")
//     .select({
//       view: "Basic",
//     })
//     .firstPage(function (err, records) {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       records.forEach(function (record) {
//         console.log("Retrieved", record.get("ID"));
//       });
//     });
