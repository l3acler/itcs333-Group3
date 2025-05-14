<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>course manager</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <script src="courses.js"></script>
</head>
<body>
  <nav>
      <ul>

      </ul>
      <ul>
        <li><a href="courses.php">Course Manager</a></li>
      </ul>
      <ul>
        <li><a href="reviews.php">Reviews Manager</a></li>
      </ul>
      <ul>
        <li><a href="comments.php">Comments Manager</a></li>
      </ul>
      <ul>

      </ul>
  </nav>
  <main class="container">
    <h1>Course Manager</h1>
    <form id="course-form">
      <label for="courseCode">Course Code:</label>
      <input type="text" id="courseCode" name="courseCode" required>
      <input type=submit value="Add Course">
    </form>
    <h2>Courses</h2>
    <div id="table-container">
      <table>
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Course Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="courses-tbody">
        </tbody>
      </table>
    </div>

    <br>
    <div role="group" id="pagination-wrapper"></div>
  </main>
</body>