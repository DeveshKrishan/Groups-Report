<a name="readme-top"></a>
# Automated Group-Report

<!-- ABOUT THE PROJECT -->
## About

![image](https://github.com/DeveshKrishan/Groups-Report/assets/91798447/c117f974-dcf3-4f72-a60b-6ad2579e015f)


The attached Google Sheet has the ability to download from Canvas (using GET API calls) to create a report of all group sets, their groups, and their members in a course. Remake of [Original](https://community.canvaslms.com/t5/Higher-Ed-Canvas-Users/Automated-report-of-group-sets-groups-and-members-in-a-course/bc-p/410748#M2166) in Google App Script.

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

![image](https://github.com/DeveshKrishan/Groups-Report/assets/91798447/804fef52-dd57-4b34-bfbc-c505a6705b27)

### Installation

_Note that this script relies upon the user is equivalent to the status of "Teacher" or above in the Canvas course._

1. Get a Canvas LMS API token by reading [Canvas LMS API Token Guide](https://community.canvaslms.com/t5/Admin-Guide/How-do-I-manage-API-access-tokens-as-an-admin/ta-p/89)
2. Head to Google App Script to copy and paste the code from `code.js`
![image](https://github.com/DeveshKrishan/Groups-Report/assets/91798447/cf449013-de9b-4c54-99d6-412480385d15)


<!-- USAGE EXAMPLES -->
## Usage

Enter the course ID of the Canvas course as well as the API Token from Canvas LMS.

_Do note that you may have to input the Canvas URL of your institution for any URLs used to fetch data. Currently, this script is used for the University of California, Irvine Canvas Courses._

Click the Download from Canvas Button to begin running the script. 

![image](https://github.com/DeveshKrishan/Student-Progress-Report/assets/91798447/9dc4b9c2-dff4-4583-9017-ba9b196c7aad)

When you want to be ready to clear the data for any reason, feel free to use the Clear Button to erase any data downloaded. 

![image](https://github.com/DeveshKrishan/Student-Progress-Report/assets/91798447/b8322ff2-8c6d-45b0-80a2-0e26efd96fd7)


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

! would like to acknowledge [stelpstra](https://community.canvaslms.com/t5/user/viewprofilepage/user-id/105030) for creating this script originally in Excel. This is a remake of his [product](https://community.canvaslms.com/t5/Higher-Ed-Canvas-Users/Automated-report-of-group-sets-groups-and-members-in-a-course/bc-p/410748#M2166) written in Google App Script. This project's design is heavily inspired by his original product. 


