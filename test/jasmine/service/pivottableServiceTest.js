describe("pivottableServiceTest", function() {
    beforeEach(function() {
        module('timesheetApp');
        inject(function ($timeout, $window, _$httpBackend_, pivottableService, applicationLoggingService) {
            AP.$timeout = $timeout;
            $window.i18nDefault = 'i18n/default.json';
            _$httpBackend_.whenGET("i18n/default.json").respond({});
            _$httpBackend_.flush();
            pivottableService.allFields = FieldsData;
            applicationLoggingService.debug = function() {};
        })
        AP.requestBak = AP.request;
    });

    afterEach(function() {
        delete AP.$timeout;
        AP.request = AP.requestBak;
    });

    // jasmine matchers and helpers methods

    beforeEach(function () {
        jasmine.addMatchers({
            toHaveRowsNumber: function() {
                return {
                    compare: function (actual, expected) {
                        var rowsCount = Object.keys(actual.rows).length;
                        return JasmineMatcherUtils.getMatcherResult(
                                rowsCount == expected,
                                "PivotTable must have " + expected + " rows, but has " + rowsCount,
                                "PivotTable mustn't have " + expected + " rows, but has " + rowsCount);
                    }
                };
            }
        });
    });

    it('Timesheet', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'Timesheet', startDate: '2014-02-24', configOptions: {}, reportingDay: 1};
        var pivotTable;
        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {
            pivotTable = _pivotTable;
        });
        $timeout.flush();
        expect(pivotTable).toBeDefined();
        expect(pivotTable).toHaveRowsNumber(6);
    }));

    it('Timesheet [endDate, w/out startDate]', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'Timesheet', endDate: '2014-03-06', configOptions: {}};
        var pivotTable;
        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {
            pivotTable = _pivotTable;
        });
        $timeout.flush();
        expect(pivotTable).toBeDefined();
        expect(pivotTable).toHaveRowsNumber(3);
        expect(pivotTable.rows['TIME-3'].sum).toEqual(21600);
        expect(pivotTable.rows['TIME-5'].sum).toEqual(18000);
        expect(pivotTable.rows['TIME-6'].sum).toEqual(7200);
        expect(pivotTable.sum).toEqual(46800);
    }));

    it('IssueWorkedTimeByUser', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'IssueWorkedTimeByUser', configOptions: {}};
        var pivotTable;
        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {
            pivotTable = _pivotTable;
        });
        $timeout.flush();
        expect(pivotTable).toBeDefined();
        expect(pivotTable).toHaveRowsNumber(6);
        expect(pivotTable.rows['TIME-5'].sum).toEqual(36000);
        expect(pivotTable.rows['TIME-6'].sum).toEqual(7200);
        expect(pivotTable.sum).toEqual(176400);
    }));

    it('IssueWorkedTimeByUser_sumSubTasks', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'IssueWorkedTimeByUser', configOptions: {parentIssueField: 'customfield_10007', compositionIssueLink: 'Duplicate'}, sumSubTasks: true};
        var pivotTable;
        AP.request = function(options) {
            if (options.url.match(/jql='Epic%20Link'%20is%20not%20EMPTY/)) {
                this.getTimeoutFunc()(function() {
                    options.success({issues: [{
                        "id" : "10002",
                        "key" : "TIME-3",
                        "timeestimate" : 0,
                        "timeoriginalestimate" : 72000,
                        "timespent" : 36000,
                        "fields": {
                            "customfield_10007" : "TIME-2"                                
                        }
                    }]});
                }, 500);
            } else {
                AP.requestBak(options);
            }
        };
        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {
            pivotTable = _pivotTable;
            pivotTable.queue['TIME-5'].promise.then(function(issue) {
                // check it is not overwritten by subscequent resolve
                expect(issue.worklog.worklogs.length).toEqual(4);
            });
        });
        $timeout.flush();
        expect(pivotTable).toBeDefined();
        expect(pivotTable).toHaveRowsNumber(2);
        expect(Object.keys(pivotTable.rows)).toContainAll(["TIME-1", "TIME-5"]);
        expect(pivotTable.rows['TIME-1'].sum).toEqual(133200);
        expect(pivotTable.rows['TIME-5'].sum).toEqual(43200);
        expect(pivotTable.sum).toEqual(176400);
    }));

    // verify subsequent resolve does not make effect
    it('deferredTest', inject(function($timeout, $q) {
        var deferred = $q.defer();
        deferred.resolve(1);
        deferred.resolve(2);
        deferred.promise.then(function(result) {
            expect(result).toEqual(1);
        });
        $timeout.flush();
    }));

    it('getPivotTable [options:set/reset] sumSubTasks: true', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'IssueWorkedTimeByUser', configOptions: {}, sumSubTasks: true};

        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {});

        $timeout.flush();

        expect(pivottableService.sumSubTasks).toEqual(true);
        expect(pivottableService.startDate).not.toBeDefined();
        expect(pivottableService.endDate).not.toBeDefined();
    }));

    it('getPivotTable [options:set/reset] sumSubTasks: false', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'IssueWorkedTimeByUser', configOptions: {}, sumSubTasks: false};

        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {});

        $timeout.flush();

        expect(pivottableService.sumSubTasks).toEqual(false);
        expect(pivottableService.startDate).not.toBeDefined();
        expect(pivottableService.endDate).not.toBeDefined();
    }));

    it('getPivotTable [options:set/reset] startDate', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'IssueWorkedTimeByUser', configOptions: {}, startDate: '2015-01-25'};

        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {});

        $timeout.flush();

        expect(pivottableService.startDate).toEqual('2015-01-25');
        expect(pivottableService.sumSubTasks).not.toBeDefined();
    }));

    it('loadAllWorklogs [worklog.total > worklog.maxResults]', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();

        var generateWorklogs = function(count) {
            var worklog = {
                "maxResults" : count,
                "startAt" : 0,
                "total" : count,
                "worklogs" : []
            };
            for (var i = 0; i < count; i++) {
                worklog.worklogs.push({
                    "comment" : "test comment " + i,
                    "created" : "2013-12-05T00:00:00.000+0100",
                    "id" : i + "00",
                    "started" : "2014-02-24T18:03:48.589+0100",
                    "timeSpent" : i + "h",
                    "timeSpentSeconds" : i * 3600
                });
            }
            return worklog;
        };

        AP.request = function(options) {
            this.getTimeoutFunc()(function() {
                if (options.url.match(/issue\/TIME-999\/worklog/)) {
                    options.success(generateWorklogs(22));
                }
            }, 500);
        };

        var issue = {
            "key": "TIME-999",
            "fields": {
                "worklog": {
                    "total": 22,
                    "maxResults": 20
                }
            }
        };
        var result;

        pivottableService.loadAllWorklogs(issue).promise.then(function(_issue) {
            result = _issue;
        });

        $timeout.flush();

        expect(result).toBeDefined();
        expect(result.fields.worklog.worklogs.length).toEqual(22);
    }));

    // test filterWorklogs fills in worklogAuthors
    it('filterWorklogs', inject(function($timeout, $q, $log, pivottableService) {
        expect(pivottableService).toBeDefined();

        var issue = {
            key: 'DEMO-1',
            worklog: {
                "maxResults" : 0,
                "startAt" : 0,
                "total" : 0,
                "worklogs" : [
                    {
                        author: {
                            name: 'admin'
                        }
                    },
                    {
                        author: {
                            name: 'test'
                        }
                    }
                ]
            }
        };

        var getTestUserInfoByNameCalled = false;
        AP.request = function(options) {
            this.getTimeoutFunc()(function() {
                if (options.url.match(/\/user\?expand=groups&username=test$/)) {
                    getTestUserInfoByNameCalled = true;
                    options.success({groups:{items: []}});
                } else {
                    AP.requestBak(options);
                }
            }, 500);
        };

        pivottableService.groups = ['jira-users'];
        pivottableService.filterWorklogs(issue);

        $timeout.flush();
        $log.assertEmpty();
        
        expect(pivottableService.worklogAuthors).toContain('admin');
        expect(pivottableService.worklogAuthors).not.toContain('test');
        expect(getTestUserInfoByNameCalled).toBeTruthy();

        expect($timeout.flush).toThrow();
    }));

    it('onAllIssues [total > maxResults]', inject(function($timeout, $log, pivottableService) {
        expect(pivottableService).toBeDefined();

        var timeData = {
            "issues": [],
            "maxResults" : 2,
            "startAt" : 0,
            "total" : 5,
        };
        for (var i = 0; i < 2; i++) {
            timeData.issues.push({
                "key" : "TEST-" + i
            });
        }

        AP.request = function(options) {
            this.getTimeoutFunc()(function() {
                var m = options.url.match(/\/search\?startAt=(\d)$/);
                if (m && [0, 2, 4].indexOf(parseInt(m[1])) >= 0) {
                    options.success(timeData);
                } else {
                    throw new Error('Unexpected call ' + options.url);
                }
            }, 500);
        };

        var result = [];
        var progress = []

        pivottableService.onAllIssues('', function(data) {
            Array.prototype.push.apply(result, data.issues);
        }).then(null, null, function(percent) {
            progress.push(percent.toFixed(2))
        });

        $timeout.flush();
        $log.assertEmpty();

        expect(result).toBeDefined();
        expect(result.length).toEqual(2);

        $timeout.flush();
        $log.assertEmpty();
        expect(result.length).toEqual(6); // the same TimeData returned three times
        expect(progress).toEqual(['0.28', '0.62', '0.95']);
        expect($timeout.flush).toThrow();
    }));

    // any issue matches
    it('checkIfMatches [empty query]', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();

        var result;

        pivottableService.checkIfMatches({}, {}).then(function(matches) {
            result = matches;
        });
        $timeout.flush();

        expect(result).toBeDefined();
        expect(result).toBeTruthy();
        expect($timeout.flush).toThrow();
    }));

    // match by project key
    it('checkIfMatches [projects only]', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();

        var result1, result2, options = {filterOrProjectId: 'project_DEMO'};

        pivottableService.checkIfMatches({fields: {project: {key: 'DEMO'}}}, options).then(function(matches) {
            result1 = matches;
        });
        pivottableService.checkIfMatches({fields: {project: {key: 'TEST'}}}, options).then(function(matches) {
            result2 = matches;
        });
        $timeout.flush();

        expect(result1).toBeDefined();
        expect(result1).toBeTruthy();

        expect(result2).toBeDefined();
        expect(result2).toBeFalsy();

        expect($timeout.flush).toThrow();
    }));

    // match by issues set
    it('checkIfMatches [filter query]', inject(function($timeout, $log, pivottableService) {
        expect(pivottableService).toBeDefined();

        var timeData = {
            "issues": [],
            "maxResults" : 2,
            "startAt" : 0,
            "total" : 2,
        };
        for (var i = 0; i < 2; i++) {
            timeData.issues.push({
                "id" : "" + (10000 + i)
            });
        }

        AP.request = function(options) {
            this.getTimeoutFunc() (function() {
                if (options.url.match(/\/search\?fields=~&maxResults=1000&jql=filter%3D10000&startAt=0$/)) {
                    options.success(timeData);
                } else {
                    throw new Error('Unexpected call ' + options.url);
                }
            }, 500);
        };

        var result1, result2, result3, options = {filterOrProjectId: 'filter_10000'};

        pivottableService.checkIfMatches({id: '10000'}, options).then(function(matches) {
            result1 = matches;
        });
        pivottableService.checkIfMatches({id: '10001'}, options).then(function(matches) {
            result2 = matches;
        });
        pivottableService.checkIfMatches({id: '10002'}, options).then(function(matches) {
            result3 = matches;
        });

        $timeout.flush();
        $log.assertEmpty();

        expect(result1).toBeDefined();
        expect(result1).toBeTruthy();

        expect(result2).toBeDefined();
        expect(result2).toBeTruthy();

        expect(result3).toBeDefined();
        expect(result3).toBeFalsy();

        expect($timeout.flush).toThrow();

        // test reset state
        pivottableService.matches = null;
        options = {filterOrProjectId: 'project_DEMO'};

        pivottableService.checkIfMatches({fields: {project: {key: 'DEMO'}}}, options).then(function(matches) {
            result3 = matches;
        });

        $timeout.flush();
        $log.assertEmpty();

        expect(result3).toBeTruthy();

        expect($timeout.flush).toThrow();        
    }));

    // test issue is added to queue only once
    it('addOnceIfMatches', inject(function($timeout, $q, $log, pivottableService) {
        expect(pivottableService).toBeDefined();

        var pivotTable = {matches: {}, queueToAdd: []}, deferred = $q.defer(), options = {};
        var issue1 = {
            key: 'DEMO-1',
            fields: {
                "issuetype": {}
            },
            worklog: {
                "maxResults" : 0,
                "startAt" : 0,
                "total" : 0,
                "worklogs" : []
            }
        }, issue2 = {
            key: 'DEMO-2',
            fields: {
                "issuetype": {}
            },
            worklog: {
                "maxResults" : 0,
                "startAt" : 0,
                "total" : 0,
                "worklogs" : []
            }
        };

        pivottableService.addOnceIfMatches(pivotTable, issue1, deferred, options);
        pivottableService.addOnceIfMatches(pivotTable, issue1, deferred, options);
        pivottableService.addOnceIfMatches(pivotTable, issue2, deferred, options);

        $timeout.flush();
        $log.assertEmpty();

        expect(pivotTable.queueToAdd.length).toBe(2);

        expect($timeout.flush).toThrow();
    }));

    it('Parent issue not in search result', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'IssueWorkedTimeByUser', configOptions: {}, sumSubTasks: true};

        var childIssue = {};
        angular.copy(TimeData.issues[5], childIssue);
        var worklog = childIssue.worklog || childIssue.fields.worklog;
        worklog.total += worklog.maxResults + 1;
        var searchResult = {issues: [childIssue]};

        AP.request = function(options) {
            this.getTimeoutFunc()(function() {
                if (options.url.match(/search/)) {
                    options.success(searchResult);
                }
            }, 500);
        };

        var spy = spyOn(pivottableService, 'loadAllWorklogs').and.callThrough();

        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {});

        $timeout.flush();

        expect(pivottableService.allIssues.length).toBe(0);
        expect(spy.calls.count()).toBe(1);
    }));

    it('PARAMETERS: groups', inject(function($timeout, $log, pivottableService) {
        expect(pivottableService).toBeDefined();
        var loggedInUser = {};
        var options = {pivotTableType: 'IssueWorkedTimeByUser', groups: ["group1", "group2"], moreFields: ['customfield_10008']};

        var requestCalled = false;

        AP.request = function(options) {
            if (options.url.match(/search/)) {
                this.getTimeoutFunc()(function() {
                        requestCalled = true;
                        expect(options.url).toContain("jql=(worklogAuthor%20in%20membersOf(%22group1%22)%20or%20worklogAuthor%20in%20membersOf(%22group2%22))");
                        options.success(angular.copy(TimeData));
                }, 500);
            } else {
                AP.requestBak(options);
            }
        };

        pivottableService.allFields = FieldsData;
        pivottableService.getPivotTable(loggedInUser, options).then(function(_pivotTable) {});

        $timeout.flush();
        $log.assertEmpty();

        expect(requestCalled).toBeTruthy();
        expect(pivottableService.allIssues.length).toBe(6);
    }));

    it('getQuery', inject(function($timeout, pivottableService) {
        expect(pivottableService).toBeDefined();
        var fields = 'fields=project,issuetype,resolution,summary,priority,status,parent,issuelinks';
        var maxResults = '&maxResults=1000';
        var query = pivottableService.getQuery({}, {pivotTableType: 'IssueWorkedTimeByUser', sumSubTasks: true, startDate: '2015-01-01', moreFields: ['timespent']});
        expect(query).toBe(fields + ',worklog,customfield_10007,timespent,subtasks' + maxResults + '&jql=' + encodeURIComponent('worklogDate>="2014-12-31"'));
        var query = pivottableService.getQuery({}, {pivotTableType: 'TimeTracking', sumSubTasks: true, moreFields: ['timespent']});
        expect(query).toBe(fields + ',timeoriginalestimate,timeestimate,timespent,customfield_10007,timespent,subtasks' + maxResults);
        var query = pivottableService.getQuery({}, {pivotTableType: 'IssuePassedTimeByStatus', startDate: '2015-01-01'});
        expect(query).toBe(fields + ',customfield_10007,created' + maxResults + '&expand=changelog&jql=(' + encodeURIComponent('status changed after "2014-12-31" or created>"2014-12-31"') + ')');
        var query = pivottableService.getQuery({}, {pivotTableType: 'IssuePassedTimeByStatus', username: 'admin'});
        expect(query).toBe(fields + ',customfield_10007,created' + maxResults + '&expand=changelog&jql=(' + encodeURIComponent('status changed by "admin" or reporter="admin"') + ')');
        var query = pivottableService.getQuery({}, {pivotTableType: 'IssuePassedTimeByStatus', groups: ['jira-users']});
        expect(query).toBe(fields + ',customfield_10007,created' + maxResults + '&expand=changelog&jql=(' + encodeURIComponent('status changed by membersOf("jira-users") or reporter in membersOf("jira-users")') + ')');
    }));
});