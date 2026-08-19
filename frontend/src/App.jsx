import { useEffect, useState } from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./api";

function App() {
  // ===============================
  // State
  // ===============================

  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Error
  const [error, setError] = useState("");

  // Toast
  const [toast, setToast] = useState("");

  // ===============================
  // Toast
  // ===============================

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  // ===============================
  // GET - Load tasks
  // ===============================

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks();

      setTasks(data);
    } catch (err) {
      setError(
        "Failed to load tasks: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when page opens
  useEffect(() => {
    loadTasks();
  }, []);

  // ===============================
  // POST - Create task
  // ===============================

  const handleCreate = async (e) => {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a task title");
      return;
    }

    setCreating(true);

    // Temporary task for optimistic UI
    const temporaryTask = {
      _id: "temporary-" + Date.now(),
      title: title.trim(),
      description: description,
      completed: false,
      optimistic: true,
    };

    // Show task immediately
    setTasks((previousTasks) => [
      temporaryTask,
      ...previousTasks,
    ]);

    // Save form data before clearing
    const taskData = {
      title: title.trim(),
      description: description,
      completed: false,
    };

    // Clear form
    setTitle("");
    setDescription("");

    try {
      // Send to backend
      const newTask = await createTask(taskData);

      // Replace temporary task
      // with MongoDB task
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === temporaryTask._id
            ? newTask
            : task
        )
      );

      showToast("Task created successfully");
    } catch (err) {
      // Remove temporary task
      // if backend fails
      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) =>
            task._id !== temporaryTask._id
        )
      );

      setError(
        "Failed to create task: " + err.message
      );
    } finally {
      setCreating(false);
    }
  };

  // ===============================
  // PUT - Mark Complete/Pending
  // ===============================

  const handleUpdate = async (task) => {
    setUpdatingId(task._id);
    setError("");

    try {
      const updatedTask = await updateTask(
        task._id,
        {
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }
      );

      // Update state using backend response
      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === updatedTask._id
            ? updatedTask
            : item
        )
      );

      if (updatedTask.completed) {
        showToast("Task marked as completed");
      } else {
        showToast("Task marked as pending");
      }
    } catch (err) {
      setError(
        "Failed to update task: " + err.message
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ===============================
  // DELETE
  // ===============================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      await deleteTask(id);

      // Remove from UI only after
      // backend confirms success
      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task._id !== id
        )
      );

      showToast("Task deleted successfully");
    } catch (err) {
      setError(
        "Failed to delete task: " + err.message
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>Task Manager</h1>

      {/* =========================
          Toast
      ========================= */}

      {toast && (
        <div
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "5px",
          }}
        >
          {toast}
        </div>
      )}

      {/* =========================
          Error
      ========================= */}

      {error && (
        <div
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "5px",
          }}
        >
          {error}
        </div>
      )}

      {/* =========================
          Create Form
      ========================= */}

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          style={{
            padding: "10px",
            width: "300px",
          }}
        />

        <br />
        <br />

        <textarea
          placeholder="Task description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          style={{
            padding: "10px",
            width: "300px",
            height: "80px",
          }}
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={creating}
          style={{
            padding: "10px 20px",
          }}
        >
          {creating ? "Adding..." : "Add Task"}
        </button>
      </form>

      <hr />

      {/* =========================
          Loading
      ========================= */}

      {loading && (
        <p>Loading tasks...</p>
      )}

      <h2>Tasks</h2>

      {/* =========================
          No tasks
      ========================= */}

      {!loading && tasks.length === 0 && (
        <p>No tasks available</p>
      )}

      {/* =========================
          Task List
      ========================= */}

      {tasks.map((task) => (
        <div
          key={task._id}
          style={{
            border: "1px solid gray",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "5px",
          }}
        >
          <h3>{task.title}</h3>

          <p>{task.description}</p>

          <p>
            <strong>Status:</strong>{" "}
            {task.completed
              ? "Completed"
              : "Pending"}
          </p>

          {/* =====================
              UPDATE
          ===================== */}

          <button
            onClick={() =>
              handleUpdate(task)
            }
            disabled={
              updatingId === task._id ||
              task.optimistic
            }
          >
            {updatingId === task._id
              ? "Updating..."
              : task.completed
              ? "Mark Pending"
              : "Mark Complete"}
          </button>

          {" "}

          {/* =====================
              DELETE
          ===================== */}

          <button
            onClick={() =>
              handleDelete(task._id)
            }
            disabled={
              deletingId === task._id ||
              task.optimistic
            }
          >
            {deletingId === task._id
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;