test("Excel Export", function() {
    var excelView = new ExcelView(TimeData.issues);
    equal(typeof excelView, 'object', 'excelView');
    var excel = excelView.generate({pivotTableType: 'Timesheet', startDate: '2014-02-24', reportingDay: 1, moreFields: [], configOptions: {}});
    equal(typeof excel, 'string', 'excel');
    equal(excel.match(/\d+h/g), null, "issue#902: hours with no h")
});
test("Csv Export", function() {
    var csvView = new CsvView(TimeData.issues);
    equal(typeof csvView, 'object', 'csvView');
    var csv = csvView.generate({pivotTableType: 'Timesheet', startDate: '2014-02-24', reportingDay: 1, moreFields: [], configOptions: {}});
    equal(typeof csv, 'string', 'csv');
    equal(csv.match(/\d+h/g), null, "issue#902: hours with no h")
});
test("Html Export Timesheet", function() {
    var htmlView = new HtmlView(TimeData.issues);
    equal(typeof htmlView, 'object', 'excelView');
    var html = htmlView.generate({pivotTableType: 'Timesheet', startDate: '2014-02-24',
        reportingDay: 1, moreFields: [], configOptions: {}, jiraConfig: {timeFormat: ''}});
    equal(typeof html, 'string', 'html');
    //console.log(html);
    var lines = html.split('\n');
    var header = lines.slice(10, 22).map(s => s.trim()).join('');
    equal(header, "<td>Issue Type</td><td>Parent</td><td>Key</td><td>Summary</td><td>Priority</td><td>Comment</td><td>24/Feb</td><td>25/Feb</td><td>26/Feb</td><td>27/Feb</td><td>28/Feb</td><td>Total</td>", "header");
    var row1 = lines.slice(24, 36).map(s => s.trim()).join('');
    equal(row1, "<td>Bug</td><td></td><td><a href='/browse/TIME-1'>TIME-1</a></td><td><a href='/browse/TIME-1'>Hocus Focus Problem</a></td><td>Major</td><td>&nbsp</td><td>8h</td><td>3h</td><td>0h</td><td>0h</td><td>0h</td><td>11h</td>", "row1");
    var row2 = lines.slice(38, 50).map(s => s.trim()).join('');
    equal(row2, "<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>test 7</td><td>&nbsp;</td><td>3h</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>", "row2");
});
test("Html Export Timesheet Compressed", function() {
    var htmlView = new HtmlView(TimeData.issues);
    equal(typeof htmlView, 'object', 'excelView');
    var html = htmlView.generate({compressed: true, pivotTableType: 'Timesheet', startDate: '2014-02-24',
        reportingDay: 1, moreFields: [], configOptions: {}, jiraConfig: {timeFormat: ''}});
    equal(typeof html, 'string', 'html');
    //console.log(html);
    var lines = html.split('\n');
    var header = lines.slice(10, 21).map(s => s.trim()).join('');
    equal(header, "<td>Issue Type</td><td>Parent</td><td>Key</td><td>Summary</td><td>Priority</td><td>24/Feb</td><td>25/Feb</td><td>26/Feb</td><td>27/Feb</td><td>28/Feb</td><td>Total</td>", "header");
    var row1 = lines.slice(23, 34).map(s => s.trim()).join('');
    equal(row1, "<td>Bug</td><td></td><td><a href='/browse/TIME-1'>TIME-1</a></td><td><a href='/browse/TIME-1'>Hocus Focus Problem</a></td><td>Major</td><td>8h</td><td>3h</td><td>0h</td><td>0h</td><td>0h</td><td>11h</td>", "row1");
    var row2 = lines.slice(36, 47).map(s => s.trim()).join('');
    equal(row2, "<td>Bug</td><td></td><td><a href='/browse/TIME-2'>TIME-2</a></td><td><a href='/browse/TIME-2'>Loch Ness Monster Bug</a></td><td>Major</td><td>0h</td><td>5h</td><td>0h</td><td>8h</td><td>0h</td><td>13h</td>", "row2");
});
test("Html Export Timesheet Grouped by Worked User", function() {
    var htmlView = new HtmlView(TimeData.issues);
    equal(typeof htmlView, 'object', 'excelView');
    var html = htmlView.generate({groupByField: 'workeduser', groupByFieldObject: {name: 'Worked User'}, pivotTableType: 'Timesheet', startDate: '2014-02-24',
        reportingDay: 1, moreFields: [], configOptions: {}, jiraConfig: {timeFormat: ''}});
    equal(typeof html, 'string', 'html');
    console.log(html);
    var lines = html.split('\n');
    var header = lines.slice(10, 22).map(s => s.trim()).join('');
    equal(header, "<td>Worked User</td><td>Issue Type</td><td>Parent</td><td>Key</td><td>Summary</td><td>Priority</td><td>24/Feb</td><td>25/Feb</td><td>26/Feb</td><td>27/Feb</td><td>28/Feb</td><td>Total</td>", "header");
    var row1 = lines.slice(24, 36).map(s => s.trim()).join('');
    equal(row1, "<td>admin</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>9h</td><td>13h</td><td>0h</td><td>13h</td><td>13h</td><td>48h</td>", "row1");
    var row2 = lines.slice(38, 50).map(s => s.trim()).join('');
    equal(row2, "<td>&nbsp;</td><td>Bug</td><td></td><td><a href='/browse/TIME-1'>TIME-1</a></td><td><a href='/browse/TIME-1'>Hocus Focus Problem</a></td><td>Major</td><td>&nbsp;</td><td>3h</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>", "row2");
});
test("Html Export TimeTracking", function() {
    var htmlView = new HtmlView(TimeData.issues);
    equal(typeof htmlView, 'object', 'excelView');
    var html = htmlView.generate({pivotTableType: 'TimeTracking', startDate: '2014-02-24',
        reportingDay: 1, moreFields: [], configOptions: {timeTrackingColumns: [
            '1timeoriginalestimate', '2esttimeremaining',  '3timespent', '4diff',
             '5originalestimateremaining', '6progress']},
        translations: {
          '1timeoriginalestimate': 'Original',
          '2esttimeremaining': 'Estimate',
          '3timespent': 'Spent',
          '4diff': 'Diff',
          '5originalestimateremaining': 'Remaining',
          '6progress': 'Progress',
        }, jiraConfig: {timeFormat: ''}});
    equal(typeof html, 'string', 'html');
    //console.log(html);
    var lines = html.split('\n');
    var header = lines.slice(10, 21).map(s => s.trim()).join('');
    equal(header, "<td>Issue Type</td><td>Parent</td><td>Key</td><td>Summary</td><td>Priority</td><td>Original</td><td>Estimate</td><td>Spent</td><td>Diff</td><td>Remaining</td><td>Progress</td>", "header");
    var row1 = lines.slice(23, 34).map(s => s.trim()).join('');
    equal(row1, "<td>Bug</td><td></td><td><a href='/browse/TIME-1'>TIME-1</a></td><td><a href='/browse/TIME-1'>Hocus Focus Problem</a></td><td>Major</td><td>0</td><td>33</td><td>11</td><td>-44</td><td>-11</td><td>25%</td>", "row1");
    var row2 = lines.slice(36, 47).map(s => s.trim()).join('');
    equal(row2, "<td>Bug</td><td></td><td><a href='/browse/TIME-2'>TIME-2</a></td><td><a href='/browse/TIME-2'>Loch Ness Monster Bug</a></td><td>Major</td><td>26</td><td>0</td><td>13</td><td>13</td><td>13</td><td>100%</td>", "row2");
});
test("Html Export TimeTracking Grouped by Assignee", function() {
    var htmlView = new HtmlView(TimeData.issues);
    equal(typeof htmlView, 'object', 'excelView');
    var html = htmlView.generate({groupByField: 'assignee', groupByFieldObject: {name: 'Assignee'}, pivotTableType: 'TimeTracking', startDate: '2014-02-24',
        reportingDay: 1, moreFields: [], configOptions: {timeTrackingColumns: [
            '1timeoriginalestimate', '2esttimeremaining',  '3timespent', '4diff',
             '5originalestimateremaining', '6progress']},
        translations: {
          '1timeoriginalestimate': 'Original',
          '2esttimeremaining': 'Estimate',
          '3timespent': 'Spent',
          '4diff': 'Diff',
          '5originalestimateremaining': 'Remaining',
          '6progress': 'Progress',
        }, jiraConfig: {timeFormat: ''}});
    equal(typeof html, 'string', 'html');
    console.log(html);
    var lines = html.split('\n');
    var header = lines.slice(10, 22 ).map(s => s.trim()).join('');
    equal(header, "<td>Assignee</td><td>Issue Type</td><td>Parent</td><td>Key</td><td>Summary</td><td>Priority</td><td>Original</td><td>Estimate</td><td>Spent</td><td>Diff</td><td>Remaining</td><td>Progress</td>", "header");
    var row1 = lines.slice(24, 36).map(s => s.trim()).join('');
    equal(row1, "<td>admin</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>73.78</td><td>33</td><td>48</td><td>-7.22</td><td>25.78</td><td>59%</td>", "row1");
    var row2 = lines.slice(38, 50).map(s => s.trim()).join('');
    equal(row2, "<td>&nbsp;</td><td>Bug</td><td></td><td><a href='/browse/TIME-1'>TIME-1</a></td><td><a href='/browse/TIME-1'>Hocus Focus Problem</a></td><td>Major</td><td>0</td><td>33</td><td>11</td><td>-44</td><td>-11</td><td>25%</td>", "row2");
});
