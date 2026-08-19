const express = require("express");

const Task = require("../models/Task");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validateTask = require(
  "../middleware/validateTask"
);

const router = express.Router();


// ==========================================
// ALL TASK ROUTES ARE PROTECTED
// ==========================================

router.use(authMiddleware);


// ==========================================
// GET ALL TASKS
// GET /tasks
// ==========================================

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({
      createdAt: -1,
    });

    res.status(200).json(tasks);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});


// ==========================================
// GET SINGLE TASK
// GET /tasks/:id
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(
      req.params.id
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(task);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch task",
      error: error.message,
    });
  }
});


// ==========================================
// CREATE TASK
// POST /tasks
// ==========================================

router.post(
  "/",
  validateTask,
  async (req, res) => {
    try {
      const {
        title,
        description,
        completed,
      } = req.body;

      const task = await Task.create({
        title: title,
        description: description || "",
        completed:
          completed !== undefined
            ? completed
            : false,
      });

      res.status(201).json(task);

    } catch (error) {
      res.status(500).json({
        message: "Failed to create task",
        error: error.message,
      });
    }
  }
);


// ==========================================
// UPDATE TASK
// PUT /tasks/:id
// ==========================================

router.put(
  "/:id",
  validateTask,
  async (req, res) => {
    try {
      const {
        title,
        description,
        completed,
      } = req.body;

      const updatedTask =
        await Task.findByIdAndUpdate(
          req.params.id,
          {
            title: title,
            description: description || "",
            completed:
              completed !== undefined
                ? completed
                : false,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedTask) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      res.status(200).json(updatedTask);

    } catch (error) {
      res.status(500).json({
        message: "Failed to update task",
        error: error.message,
      });
    }
  }
);


// ==========================================
// DELETE TASK
// DELETE /tasks/:id
// ==========================================

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const deletedTask =
        await Task.findByIdAndDelete(
          req.params.id
        );

      if (!deletedTask) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      res.status(200).json({
        message: "Task deleted successfully",
      });

    } catch (error) {
      res.status(500).json({
        message: "Failed to delete task",
        error: error.message,
      });
    }
  }
);


module.exports = router;