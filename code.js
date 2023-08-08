function main() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); //Grab current sheet 
    const setUpInfo = setUp(sheet);

    let course_num = setUpInfo[0];
    let headers = setUpInfo[1];

    oddAndEvenColors = findOddAndEvenColors(sheet);
    let arrayOfGroupInfo = findGroupsAndGroupSets(course_num, headers);
    groupSet = arrayOfGroupInfo[0];
    groupInfo = arrayOfGroupInfo[1];
    writePeopleAndGroupsInSheet(sheet, headers, groupInfo);

}

function setUp(sheet){
    // Writes the set up of the Google Sheet such as Group Set, Group, and 0% in the % Downloaded section as well as 
    // returns the course_num and header which is extracted from the specified cells. 
    let course_num;
    let accesstoken;
    let headers;
    // Faster to get a Range List and use a for loop to set values than to call getRange() multiple times.
    let startChanges = sheet.getRangeList(["A5", "B5", "A3", "B2", "N2", "B1"]).getRanges(); // Read which index each A1 Notation cell corresponds to. For example, A5 at index 0 is where Group Set is written. 
    startChanges[0].setValue("Group Set").setFontWeight("bold");
    startChanges[1].setValue("Group").setFontWeight("bold");
    startChanges[2].setValue(`0%`).setFontWeight("bold");
    course_num = startChanges[3].getValue(); // Grab course_num from "B2" cell
    accesstoken = startChanges[4].getValue(); // Grab accesstoken from "N2" cell
        headers = {
        'Authorization' : 'Bearer '+ accesstoken
        }
    findTitleOfCourse(course_num, headers, startChanges[5]); // Write the title of the course in "B1"

    return [course_num, headers];
}

function findTitleOfCourse(course_num, headers, cell){
    // Grabs the course name and id and displays in the cell given.
    let data;
    try{
      let url = 'https://canvas.eee.uci.edu/api/v1/courses/' + course_num  + "?per_page=100"; 
      data = JSON.parse(UrlFetchApp.fetch(url, {headers:headers}).getContentText());
    }
    catch(e){
      console.error(`Error running API call to fetch course name and course id: ${e}`);
    }
    // Writes the course name and id to the sheet.
    try{
      const courseTitle = `${data.name} (${data.id})`;
      cell.setValue(courseTitle).setFontWeight("bold");
    }
    catch(e){
      console.error(`Error when writing course name and id to sheet: ${e}`);
    }

}

function findOddAndEvenColors(sheet){
    // Grabs the colors at cells "J2" and "K2" and returns the hexadecimal version of those colors. 
    const oddAndEvenColors = []
    // https://developers.google.com/apps-script/reference/spreadsheet/range#getbackgrounds
    try{
      const bgColors = sheet.getRange("J2:K2").getBackgrounds();
      for (let i in bgColors) {
        for (let j in bgColors[i]) {
          oddAndEvenColors.push(bgColors[i][j]);
        }
      }
    }
    catch(e){
      console.error(`Error when grabbing the background colors from cells "J2:K2": ${e}`);
    }
    return oddAndEvenColors;
}

function findGroupsAndGroupSets(course_num, headers){
    // Grab all the group set and groups and map their id to their name. 
    // https://canvas.instructure.com/doc/api/group_categories.html#method.group_categories.index
    const groupSet = new Map();
    try{
      url = 'https://canvas.eee.uci.edu/api/v1/courses/' + course_num + '/group_categories' + "?per_page=100"; 
      data = JSON.parse(UrlFetchApp.fetch(url, {headers:headers}).getContentText()); 
      for (let group of data){
        groupSet.set(group.id, group.name);
      }
    }
    catch(e){
      console.error(`Error when fetching all group sets: ${e}`);
    }

    // https://canvas.instructure.com/doc/api/groups.html#method.groups.show
    const groupInfo = new Map();
    try{
      url = 'https://canvas.eee.uci.edu/api/v1/courses/' + course_num + '/groups' + "?per_page=100";  // Will show max 100 groups. Feel free to change number to any number such as 2000.
      data = JSON.parse(UrlFetchApp.fetch(url, {headers:headers}).getContentText()); 
      for (let group of data){
        groupInfo.set(group.id, [group.name, group.group_category_id]);
      }
    }
    catch(e){
      console.error(`Error when fetching all groups: ${e}`);
    }

    return [groupSet, groupInfo];
}

function writeMembersInSheet(groupInfo, headers, columnCounter, sheet){
    // Writes the Member 1, Member 2, Member 3.... 
    // Calculates the max number of people in all the groups and writes that number of members in the Google Sheet.
    let maxPeople = 0;
    try{
      for (let id of groupInfo.keys()) {
        url = 'https://canvas.eee.uci.edu/api/v1/groups/' + id + "/users" +"?per_page=100"; //limit to finding a 100 groups in a course. If a course has more than 100 groups, you can increase this number.      
        data = JSON.parse(UrlFetchApp.fetch(url, {headers:headers}).getContentText()); 
        maxPeople = Math.max(maxPeople, data.length);
      }
    }
    catch(e){
      console.error(`Error finding max number of people in groups: ${e}`);
    }

    // Writes the number of members given a number of members.
    try{
      const memberArr = [[]]
      const memberCell = sheet.getRange(5, columnCounter, 1, maxPeople);

      for (let i = 0; i < maxPeople; i++){
        memberArr[0].push(`Member ${i + 1}`);
      }

      console.log(memberArr, columnCounter);
      memberCell.setValues(memberArr).setFontWeight("bold");
    }
    catch(e){
      console.error(`Error ocurred while writing the Members 1, Members 2... to the sheet: ${e}`);
    }

    // Write to the clearData sheet
    try{
      let memberRange = `[5, 3, 1, ${maxPeople}]`;
      const clearDataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('clearData');
      clearDataSheet.getRange(2, 2).setValue(memberRange);
    }
    catch(err){
      console.error(`Error has occurred with writing to clearData sheet with member deletion. Error is: ${err}`)
    }


    return maxPeople;
}


function writePeopleAndGroupsInSheet(sheet, headers, groupInfo){
    // WRites all the groups, groupsets, and people into the Google Sheet
    // Note, any cell that has .setFontWeight("bold") writes into that cell as bold.
    let startRow = 6; // Which row data starts to write.
    let startCol = 3; // Which coolumn data starts to write.
    let maxPeople = writeMembersInSheet(groupInfo, headers, startCol, sheet);
    let progress = 0;

    const student2DArr = [];
    const student2DColor = [];

    for (let [id, name] of groupInfo.entries()) {
      let data;
      let tempArr;
      try{
        const url = 'https://canvas.eee.uci.edu/api/v1/groups/' + id + "/users" +"?per_page=100"; // Finds up to 100 people in each group. Feel free to increase. 
        data = JSON.parse(UrlFetchApp.fetch(url, {headers:headers}).getContentText()); 

        const singleGroup = name[0];
        const singleGroupSet = groupSet.get(name[1]); // Find which groupset the group belongs to
        tempArr = [singleGroupSet, singleGroup];
      }
      catch(e){
        console.error(`Error when fetching all people in a group: ${e}`);
      }

      let personCounter = 0;
      const tempColorArr = [];
      for (let person of data){ // Iterate through group of people in a group
        tempArr.push(person.sortable_name);
        // Setting the background colors.
        personCounter % 2 == 0 ? tempColorArr.push(oddAndEvenColors[0] ) : tempColorArr.push(oddAndEvenColors[1]);
        personCounter++;

      }
      const missing = maxPeople - (tempArr.length - 2)
      for (let i = 0; i < missing; i++){
        tempArr.push("");
        tempColorArr.push("ffffff");
      }
      student2DColor.push(tempColorArr);
      student2DArr.push(tempArr);

      // Updating the downloaded section. Can take out if not helpful for an increase in performance. 
      progress++;
      const percentage = Math.floor((progress / groupInfo.size) * 100);
      sheet.getRange("A3").setValue(`${percentage}%`).setFontWeight("bold");
    }

    try{
      sheet.getRange(startRow, 1, student2DArr.length, student2DArr[0].length).setValues(student2DArr).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);;
      sheet.getRange(startRow, 1, student2DArr.length, 2).setFontWeight("bold");
      sheet.getRange(startRow, startCol, student2DColor.length, student2DColor[0].length).setBackgrounds(student2DColor);
    }
    catch(e){
      console.error(`Error when writing the students and groups into the sheet: ${e}`);
    }

      
    // Write to the clearData sheet. Note that this is a hidden sheet. 
    try{
      let moduleRange = `[${startRow}, 1, ${student2DArr.length}, ${2 + maxPeople}]`;
      const clearDataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('clearData');
      clearDataSheet.getRange(2, 1).setValue(moduleRange);
    }
    catch(err){
      console.error(`Error has occurred with writing to clearData sheet. Error is: ${err}`)
    }
}


function clearEverything(){
    // Works with the clear button and erases all content and formatting in the clearSection range.
    // Note, to view the range, head to the toolbar on the top of the screen, go to Data -> Named ranges and hover over clearSection in the Named ranges section on the right to see the range. 
    // Feel free to edit the range in case some parts of the sheet are not getting deleted by the script. 
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); //Grab current sheet 
    // https://spreadsheet.dev/clear-a-range-in-google-sheets-using-apps-script 
    sheet.getRange("A3").setValue(`0%`).setFontWeight("bold");

    try{
      const clearDataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('clearData');
      var ranges = clearDataSheet.getRangeList(["A2", "B2"]).getRanges();
      for (const cell of ranges){
        let range = eval(cell.getValue());
        console.log(range);
        sheet.getRange(range[0], range[1], range[2], range[3]).clearContent().clearFormat();
      }
    }
    catch(e){
      console.error(`An error occurred while clearing the content: ${e}`)
    }
}


// Resources to read for optimization: 

// https://stackoverflow.com/questions/58811006/getvalue-take-too-long-in-google-script
// https://webapps.stackexchange.com/questions/151412/how-to-combine-multiple-ranges-with-getrange-in-order-to-clear-the-contents-of-s
