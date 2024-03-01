# Using and Testing New Features
### Installation

   1. Follow the instructions in the Build Checkpoint section of the 313 website: <https://cmu-313.github.io/projects/P1/1_checkpoint/#repository-setup>

   2. Make sure that patch-package has been ran during the post install script during installation. If not, please run `npm run postinstall` after completing the installation.


### Using and testing modifiable variable post length for students and instructors
- Log in with an administrator account
- Navigate to Admin Settings, then Post settings
- Change minimum and maximum post length sliders for students
- Change minimum and maximum post length sliders for instructors
- Log in as an instructor, and attempt making posts too short, or too long with respect to the updated parameters for instructors
- Log in as a student, and attempt making posts too short, or too long with respect to the updated parameters for students
  
Automated tests in spring24-nodebb-nodebfs/test/posts.js. The tests attempt to make invalid short/long posts for both students and instructors given the parameters set for post lengths. These tests are sufficient since they replicate the errors that should happen if posts don’t satisfy the post length requirements if the user is a student, and if the user is an instructor.

### Using and testing modifiable variable title length for students and instructors
- Log in with an administrator account
- Navigate to Admin Settings, then Post settings
- Change minimum and maximum post title sliders for students
- Change minimum and maximum post title sliders for instructors
- Log in as an instructor, and attempt making post titles too short, or too long with respect to the updated parameters for instructors
- Log in as a student, and attempt making post titles too short, or too long with respect to the updated parameters for students
  
Automated tests in spring24-nodebb-nodebfs/test/posts.js. The tests attempt to make invalid short/long post titles for students and instructors given the parameters set for post title lengths. These tests are sufficient since they replicate the errors that should happen if post titles don’t satisfy the length requirements if the user is a student, and if the user is an instructor.


### Using and testing the hiding of anonymous posts in user profiles.
- Log in as either a student or an instructor.
- Make a non-anonymous post, and click on your own user profile. The post should show up here.
- Make an anonymous post, and click on your own user profile. The post should not appear.

Automated tests in spring24-nodebb-nodebfs/test/user.js. The tests attempt to make posts non-anonymously and see if they show up. The only way to test if a post doesn’t show up visually in a user’s profile is by testing manually, so we did not automate this step.

### Using and testing the anonymizing of usernames in group posts.
- Log in with your account.
- Click on a category on the home page.
- Click “New Topic” to open up a Composer new post module.
- Check/uncheck the “Make Anonymous?” checkbox to make your post anonymous.
- Fill in the relevant details and press “Submit”.
- Click into a relevant group (you can use “Administrators”) should hide the user information of the recent posts in the group.

Automated tests in spring24-nodebb-nodebfs/test/posts.js. To test that the anonymous feature is passed in properly, we use tests in the post summary to see if the anonymous property is actually included in the information shown to the front-end. We also modify existing tests and schemas to ensure that the property is passed in. These automated tests make sure that the backend actually stores anonymous properties. Along with visual confirmation on the group page, these tests show that the anonymous feature is working properly.

### Using and testing the hiding of anonymous posts in Categories.
- Log in as either a student or an instructor.
- From the home page, select one of the Categories. Default options are Announcements, General Discussion, Comments & Feedback, or Blogs.
- Once in the Category, make a non-anonymous topic and click either Categories or the NodeBB logo. The new topic you just made should show up in the right next to the category you made your new topic in. When you hover over the profile icon of the user that made the post, you will see their username (i.e. your username in this case).
- Select a Category (the same category or a different category both work).
- Once in the Category, make an anonymous topic and click either Categories or the NodeBB logo. The new topic you just made should show up in the right next to the category you made your new topic in. When you hover over the profile icon of the user that made the post, you will see “anonymous” instead of the user’s username.

Automated tests in spring24-nodebb-nodebfs/test/categories.js. The test looks through the structure of the categories, topics, and posts created by the existing tests to verify the existence and type of the anonymous field. It makes sure the anonymous property is actually being used and received from the backend.
