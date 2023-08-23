var express = require("express");
var router = express.Router();
const getBase = require("../util/airbase");
const {
  getCourseBase,
  getActiveCourses,
  getActiveCLWItems,
  getStudentCLW,
  checkStudentCode,
} = require("../util/classwork");

/* GET home page. */
router.get("/", async function (_req, res) {
  res.render("index", {
    title: "Classwork Page",
  });
});

/* GET home page. */
router.get(
  "/:student_code/grades/:course_name",
  async function (req, res, next) {
    const { student_code, course_name } = req.params;
    try {
      const course = await getCourseBase(course_name);
      if (!course) {
        throw Error("No Grades available");
      }
      const items = await getActiveCLWItems(course.base);
      if (!items || items.length === 0) {
        throw Error("No Grades available");
      }
      const grades = await getStudentCLW(course.base, student_code, items);

      if (!grades || grades.length === 0) {
        throw Error("No Grades available");
      }
      res.render("grades", {
        title: "Classwork",
        grades: grades.filter((x) => x.category === "grade"),
        info: grades.filter((x) => x.category === "info"),
        course: course.name,
      });
    } catch (error) {
      next(Error("No Grades available, please check your link"));
    }
  }
);

router.post("/classwork", async (req, res) => {
  const { student_code } = req.body;
  if (!student_code) {
    res.send(`
    <div class="alert alert-danger" role="alert">
    Please provide a correct code.
    </div>
    `);
  } else {
    res.send(`
    <div 
    hx-get="/classwork/${student_code}"
    hx-target="this"
    hx-swap="innerHTML"
    hx-trigger="load"
    >Loading grades, please wait ...</div>
    `);
  }
});
/* GET CLASSWORK. */
router.get("/classwork/:student_key", async function (req, res) {
  const { student_key } = req.params;
  if (!student_key) {
    res.send(`
    <div class="alert alert-danger" role="alert">
    Please provide a correct code.
    </div>
    `);
  } else {
    try {
      const courses = await getActiveCourses();
      const courseBaseKey = await Promise.all(
        courses.map(async (crs) => {
          return {
            ...crs,
            check: await checkStudentCode(student_key, crs.base),
          };
        })
      );
      const { name, base } = courseBaseKey.filter((v) => v.check)[0];
      const items = await getActiveCLWItems(base);
      if (!items || items.length === 0) {
        res.send(`
      <div class="alert alert-info" role="alert">
      No grades available at this time, please contact me.
      </div>
      `);
      } else {
        const grades = await getStudentCLW(base, student_key, items);
        if (!grades || grades.length === 0) {
          res.send(`
            <div class="alert alert-info" role="alert">
            No grades available at this time, please contact me.
            </div>
            `);
        } else {
          res.render("grades", {
            // title: "Classwork",
            grades: grades.filter((x) => x.category === "grade"),
            info: grades.filter((x) => x.category === "info"),
            course: name,
          });
        }
      }
    } catch (error) {
      res.send(`
            <div class="alert alert-info" role="alert">
            Please provide a correct code.
            </div>
            `);
      // res.status(500).send(new Error(error));
    }
  }
});

/* GET home page. */
router.get("/blog", function (_req, res, next) {
  res.send(`<h3>Blog</h3>`);
});

module.exports = router;
