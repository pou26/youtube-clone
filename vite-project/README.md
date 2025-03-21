YouTube Clone Project Setup and Usage Guide
Project Setup
To set up the project, you need to install dependencies for both the server and client separately:

cd server
npm i

# Install client dependencies
cd vite-project
npm i

# Usage Guide

1.Authentication
A. Sign Up

Navigate to the navbar and click the sign-in option
Select "Sign Up" and create an account with your credentials

B. Sign In

Click on the sign-in option in the navbar
Use the following test credentials:

Email: poushaliaich1999@gmail.com
Password: Poushali@0123



2.Channel Creation and Management
A. Creating a Channel

After signing in, click on your user avatar in the navigation bar
Select "Create Your Channel" from the dropdown menu
Fill out all required fields in the channel creation form
Submit the form
The "Create Your Channel" option will automatically change to "View Your Channel"

Click on View your Channel to view the channel Page.

B. Customizing Your Channel

Navigate to your channel page
Click on "Customize Channel"
Make your desired changes
Submit to save your changes

3.Video Management
A. Uploading Videos

Go to your channel page
Click on "Upload Video"
Complete the video upload form with all required details
Submit the form
Refresh the channel page to see your newly uploaded video

B. Editing Videos

Navigate to "Manage Videos" on your channel page
Click the edit icon next to the video you want to modify
Update the desired fields in the form
Submit to save your changes

C. Deleting Videos
Option 1:

Go to "Manage Videos"
Select the checkbox next to videos you want to delete
Click the delete button

Option 2:

Go to "Manage Videos"
Click the delete icon next to the video you want to remove

4. Interaction Features
Comments

Sign in to your account
Click on any video to view it
Scroll down to the comment section
Write your comment and post it
You can edit or delete your own comments using the options below each comment

5. Search Functionality

Type any keywords in the search box at the top of the page
Videos with matching titles will appear in the results

6. Video Filtering

Click on any category filter button on the home page
Videos will be filtered according to the selected category

Note About Default Content

The application doesn't come with default videos or channels
You must create a channel and upload videos to see the full functionality
Alternatively, you can manually add a ChannelId to video data in MongoDB to associate videos with channels
After each creation or modification you need to refresh
You can login with google as well






# YouTube Clone Features

Core Features
User Authentication

Secure sign-up and login system
User profile management with avatar support
Session persistence across page refreshes

Channel Management

Create personalized channels with custom details
Customize channel appearance and information
View channel analytics and performance metrics

Video Management

Upload videos with metadata (title, description, categories)
Edit video details after uploading
Delete unwanted videos individually or in batch
Organize videos within your channel

Video Playback

High-quality video playback interface
Responsive player that works across devices
Video interaction controls (like, dislike, share)
Video information display (views, publish date)

Commenting System

Post comments on videos
Edit or delete your own comments
Comment sorting options (newest first, top comments)
Reply functionality for engaging in discussions

Search and Discovery

Search for videos by keywords in titles
Filter videos by categories
Browse related videos while watching content
Discover new content through recommendation systems

Social Features

Subscribe to channels you enjoy
Share videos across platforms
Interact with content creators through comments
Build a personalized feed based on subscriptions