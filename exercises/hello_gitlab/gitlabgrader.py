"""
This is a small unit test extension to ease grading with unit tests.
A more complete set of grading tools could be included in a container
so it doesn't have to be repeated for different python exercises.
"""
#import pycurl
import io as io
import json
#import requests
import sys

"""
.secret file should contain the user's PRIVATE TOKEN
"""
with open('/exercise/.secret','r') as f: PRIVATE_TOKEN = f.read()



class GitlabGrader():
    
    success={}
    failure={}
    hooks = ['"before all" hook', '"after all" hook', '"before each" hook', '"after each" hook']


    """
    #curl -H 'Content-Type: application/json' -H 'PRIVATE-TOKEN: XXX' -X GET https://course-gitlab.tuni.fi/api/v4/projects?search=sq_testing
    """    
    def getAPIContent(self,url):
        storage = io.BytesIO()
        c = pycurl.Curl()
        c.setopt(pycurl.WRITEFUNCTION, storage.write)
        c.setopt(c.URL, url)
        c.setopt(pycurl.HTTPHEADER, ['Content-Type: application/json','PRIVATE-TOKEN: '+PRIVATE_TOKEN])
        c.perform()
        c.close()
        content = storage.getvalue()
        j_content =json.loads(content)
        return j_content
    
    def getProjectName(self, git_url):
        return git_url.split("/")[1].split(".")[0]

    
    def getProjectId(self, git_url):
        projectName = self.getProjectName(git_url)
        url = self.getProjectIdUrl(projectName)
    
        # exact match and match of the nameSpace matter 
        j = self.getAPIContent(url)
        fieldName='ssh_url_to_repo'
        git_matches = [git_matches for git_matches in j if git_matches[fieldName]==git_url] 
        if len(git_matches)>0: 
            return git_matches[0]["id"]
        return None

    def getProjectIdUrl(self, projectName):
#        return  f'https://course-gitlab.tuni.fi/api/v4/projects?search={projectName}'       
        return  'https://course-gitlab.tuni.fi/api/v4/projects?search='+projectName       

    
    """
    # curl -s --request GET --header "PRIVATE-TOKEN: $ACCESS_TOKEN" https://course-gitlab.tuni.fi/api/v4/projects/$PROJECT_ID/pipelines > pipelines.json
    # [{"id":11848,"sha":"768a1a64c4de525c12dc0b15126a72e7f92068bf","ref":"master","status":"success","web_url":"https://course-gitlab.tuni.fi/tie-23516-bwa-2019/sq_testing/pipelines/11848"}]
    request and response
    
    
    gitHASH arvosta vielä sen verran, että jos kurssilla on useampi palautus käyttäen samaa git-repositorya, niin ihan opiskelijoiden arvostelun oikeellisuuden kannalta tuo palautusversion HASH on aina talletettavala ja käytettävä tarkastuksessa.

Näin ei saisi koskaan käydä:
1. opiskelija palauttaa master-haaraan koodinsa (gitURL)
2. kuluu aikaa (automaatti rikki, assari tarkastaa)
3. opiskelija on aloittanut uuden palautuksen tekoa ja tarkoitusella tai vahingossa rikkoo
    aiemman palautukse koodin uudemmissa versioissa master-haarassaan
4. tarkastus tapahtuu hakemalla rikkinäinen uusin versio git:stä ja opiskelija saa sen takia
   huonon arvostelun tai hylätyn.

Meidän puolen tekniikan täytyy pitää huoli, että tarkastukseen tulee se versio minkä opiskelija on oikeasti palauttanut.
    
    """
    def getPipelineId(self, projectId, sha=None):
        url = 'https://course-gitlab.tuni.fi/api/v4/projects/'+str(projectId)+'/pipelines'       
        j = self.getAPIContent(url)
        if sha is not None:
            j_sha = [j_sha for j_sha in j if j_sha['sha']==sha]
        else: j_sha=j
        if len(j_sha)>0: return j_sha[0]["id"]
        return None


    """
    # curl -s --request GET --header "PRIVATE-TOKEN: $ACCESS_TOKEN" https://course-gitlab.tuni.fi/api/v4/projects/$PROJECT_ID/pipelines/$PIPELINE_ID/jobs > job_info.json
    request and response
    """
    def getJobId(self, projectId, pipelineId, jobName=None):
        url = 'https://course-gitlab.tuni.fi/api/v4/projects/'+str(projectId)+'/pipelines/'+str(pipelineId)+'/jobs'
        j = self.getAPIContent(url)
        if jobName is not None:
            j_job = [j_job for j_job in j if j_job['name']==jobName]
        else: j_job=j
#        return j_job[0]["id"] #this is the earlies
        # we want the latest - actually this would be even better if it checks the existence of an artifact
#        return j_job[len(j_job)-1]["id"]
        return self.getJobIdWithArtifact(projectId, j_job)
    
    
    def getJobIdWithArtifact(self, projectId, j_job):
        for ii in range(len(j_job)-1, 0, -1):
            jobId = j_job[ii]["id"]
            r = requests.head(self.getArtifactUrl(projectId, jobId), allow_redirects=True, 
                             headers={'PRIVATE-TOKEN': PRIVATE_TOKEN,
                                      'Content-Type': 'application/json',
                                      })
            if r.status_code != 404: return jobId
        return None
        

    def getArtifactUrl(self, projectId, jobId):
#        return f"https://course-gitlab.tuni.fi/api/v4/projects/{projectId}/jobs/{jobId}/artifacts/mochawesome-report/mochawesome.json"
        return "https://course-gitlab.tuni.fi/api/v4/projects/"+projectId+"/jobs/"+jobId+"/artifacts/mochawesome-report/mochawesome.json"

    """
    ## toimii selaimessa:
    https://course-gitlab.tuni.fi/api/v4/projects/2066/jobs/32490/artifacts/mochawesome-report/mochawesome.json    
    """
    def getReport(self, projectId, jobId):
        url = self.getArtifactUrl(projectId, jobId)
        r = requests.get(url, allow_redirects=True, 
                         headers={'PRIVATE-TOKEN': PRIVATE_TOKEN,
                                  'Content-Type': 'application/json',
                                  })
        open('report.json', 'wb').write(r.content)


    def analyseReport(self):
        with open("report.json", "rb") as binaryfile :
            myArr = bytearray(binaryfile.read())
        report = json.loads(myArr)
        points=report["stats"]["passes"]
        max_points=report["stats"]["tests"]
        return points, max_points, report["results"]




# tests is a list of these
# {
#    "title": "should register successfully a correct user",
#    "fullTitle": "/users /register should register successfully a correct user",
#    "timedOut": False,
#    "duration": 131,
#    "state": "passed",
#    "speed": "slow",
#    "pass": True,
#    "fail": False,
#    "pending": False,
#    "context": None,
#    "code": "const response = await request\n    .post(registerUrl)\n    // .type('form')\n    .type('json')\n    .send(payload2);\nexpect(response.statusCode).to.equal(200);",
#    "err": {},
#    "uuid": "75859d00-233f-4313-8899-8272627f8ab9",
#    "parentUUID": "115a9e33-37ca-4c9e-b866-65cc98113b13",
#    "isHook": False,
#    "skipped": False
#  },
    def getSuccess(self):
        return "<pre>"+self.getCasesAsColumn(GitlabGrader.success,True)+"</pre>"

    def getFailure(self):
        return "<pre style='color: red;'>"+self.getCasesAsColumn(GitlabGrader.success)+"</pre>"
        
    
    def getCasesAsColumn(self, suites, hasSmiley=False):
        feedback=""
        for suite in suites:
            intendation = self.getIndentation(suite)
            feedback = feedback + intendation+ suite + "\n"
            cases = suites[suite]
            for case in cases:            
                if hasSmiley: 
                    feedback = feedback +intendation+ "&#9786; " +case+"\n"
                else:
                    feedback = feedback +intendation+ case+"\n"
            feedback= feedback+"\n"
        return feedback

    def getIndentation(self, suite):
        number = len(suite.split("-"))
        return "  "*number

    def getFeedbackRecursive(self, results, feedback=""):
        
        if isinstance(results, list):
            results = { i : results[i] for i in range(0, len(results) ) }

        for key in results:
            newResults = results[key] 
            if (key=="title"):
                if ("pass" in results):
                    if results["pass"]:
                        if feedback in GitlabGrader.success:
                            GitlabGrader.success[feedback].append(newResults)
                        else: GitlabGrader.success[feedback]=[newResults]
                    else:                        
                        if any(hook in newResults for hook in GitlabGrader.hooks): 
                            continue
                        if feedback in GitlabGrader.failure:
                            GitlabGrader.failure[feedback].append(newResults)
                        else: GitlabGrader.failure[feedback]=[newResults]
            if (isinstance(newResults, (list,dict)) and len(newResults)>0):  
                suite=""
                if (key=="suites"):
                    suite = results["title"]
                if feedback=="":
                    feedback=suite
                elif suite!="":
                    feedback=feedback+"-"+suite    
                self.getFeedbackRecursive(newResults,feedback)


#    def getFeedbackRecursive2(self, results, feedback):
#        
#        if isinstance(results, list):
#            results = { i : results[i] for i in range(0, len(results) ) }
#
#        titles = []
#        for key in results:
#            newResults = results[key] 
#            if (key=="title" and newResults not in titles):
#                if ("pass" in results):
#                    print(newResults+" "+str(results["pass"])+" "+str(feedback))
#                    titles.append(newResults)
#            if (isinstance(newResults, (list,dict)) and len(newResults)>0):  
#                if (key=="suites"):
#                    print("in keys", key)
#                    if results["title"]: print("title ",results["title"], feedback)
#                    feedback = feedback+1
#                self.getFeedbackRecursive(newResults,feedback)
#


    """
    Prints out test grading points in addition to normal text test runner.
    Passing a test will grant the points added to the end of the test
    docstring in following format. 

    TODO: ryhmät    
    https://course-gitlab.tuni.fi/tie-23516-bwa-2019/sq_testing
    https://course-gitlab.tuni.fi/api/v4/projects
    
// #capture pre echo "groups.json:"
// #capture pre cat groups.json
// #capture pre echo $GROUP_ID

// #   4) Study jobs and grade based on mochawesome report

// if [ $STATUS = 0 ]; then
//   echo '<div class="alert alert-success">Program compiled successfully, well done! Have some points!</div>' >> /feedback/out
//   echo 1/1 > /feedback/points
// else
//   echo '<div class="alert alert-warning">Tests for the mandatory part of the assignment failed due to missing or erroneous jobs. Please check that your
// .gitlab-ci.yml contains new jobs in stages build and test and that the build job has status success.</div>' >> /feedback/out
//   echo 0/0 > /feedback/points
// fi
    """
    def __init__(self, jobName = "MochaTests", git_url="git@course-gitlab.tuni.fi:tie-23516-bwa-2019/sq_testing.git", sha=None):
        print("here")
        #        git_url="git@course-gitlab.tuni.fi:tie-23516-bwa-2019/sq_testing.git"
        #
        # first: project_id based on the git url 
        projectId = self.getProjectId(git_url)
        print(projectId)
        #
        # gitHASH enables multiple submissions for one repo
        pipelineId = self.getPipelineId(projectId, sha)
        print(pipelineId)
        #
        # this is the job name in .gitlab-ci.yaml
        # by defining a job name there can be multiple jobs for the 
        # same repo, but getReport parses only the needed results
#        jobName = "MochaTests"  #TODO: this must be got from the exercise HTML
        jobId = self.getJobId(projectId, pipelineId, jobName)
        print(jobId)
        # 
        #
        self.getReport(projectId, jobId)
        self.points, self.max_points, results = self.analyseReport()
#        self.feedback = 
        self.getFeedbackRecursive(results)
        

if __name__ == '__main__':
    grader = None
    
    try:
        print(sys.argv)
        git_url = sys.argv[1]
        git_hash = sys.argv[2]
        job_name = sys.argv[3]
#        grader = GitlabGrader("MochaTests",git_url, git_hash)
        grader = GitlabGrader()
#        print(GitlabGrader.success)
#        print(GitlabGrader.failure)
#        print(grader.getSuccess())
#        print(grader.getFailure())
    
    
    
    except Exception as e:
        print("ERROR:", file=sys.stderr)
        print(e, file=sys.stderr)
    finally:
#        print(grader.points,"/", grader.max_points)
#        print("TotalPoints: {}".format(grader.points))
#        print("MaxPoints: {}".format(grader.max_points))
  
        print("TotalPoints: {}".format(5))
        print("MaxPoints: {}".format(10))
    
    