<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>comments manager</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <script src="comments.js"></script>
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
    <h1>Comments Manager</h1>
    <form id="comment-form">
      <label for="reviewId">Review ID:</label>
      <input type="number" id="reviewId" name="reviewId" required>

      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>
      
      <label for="date">Date:</label>
      <input type="date" id="date" name="date" required>

      <label for="content">Content:</label>
      <textarea id="content" name="content" required></textarea>
      
      <input type=submit value="Add Comment">
    </form>
    <h2>Comments</h2>
    <table>
      <thead>
        <tr>
          <th>Comment ID</th>
          <th>Review ID</th>
          <th>Name</th>
          <th>Date</th>
          <th>Content</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="comments-tbody">
      </tbody>
    </table>

    <br>
    <div role="group" id="pagination-wrapper"></div>
  </main>  
</body>