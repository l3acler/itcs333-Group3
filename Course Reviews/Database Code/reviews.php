<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>reviews manager</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <script src="reviews.js"></script>
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
    <h1>Reviews Manager</h1>
    <form id="review-form">
      <label for="courseId">Course ID:</label>
      <input type="number" id="courseId" name="courseId" required>

      <label for="posterId">Poster ID:</label>
      <input type="number" id="posterId" name="posterId" required>

      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>

      <label for="date">Date:</label>
      <input type="date" id="date" name="date" required>

      <label for="rating">Rating:</label>
      <input type="number" id="rating" name="rating" min="1" max="5" required>

      <label for="content">Content:</label>
      <textarea id="content" name="content" required></textarea>
      <input type=submit value="Add Review">
    </form>
    <h2>Reviews</h2>
    <table>
      <thead>
        <tr>
          <th>Review ID</th>
          <th>Course ID</th>
          <th>Poster ID</th>
          <th>Name</th>
          <th>Date</th>
          <th>Rating</th>
          <th>Content</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="reviews-tbody">
      </tbody>
    </table>

    <br>
    <div role="group" id="pagination-wrapper"></div>
  </main>  
</body>