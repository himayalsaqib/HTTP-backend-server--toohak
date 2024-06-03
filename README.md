# COMP1531 Major Project

**✨ 🥜 Toohak 🥜 ✨**

## Contents

[[_TOC_]]

## Change Log

N/A

## 🫡 0. Aims:

1. Demonstrate effective use of software development tools to build full-stack end-user applications.
2. Demonstrate effective use of static testing, dynamic testing, and user testing to validate and verify software systems.
3. Understand key characteristics of a functioning team in terms of understanding professional expectations, maintaining healthy relationships, and managing conflict.
4. Demonstrate an ability to analyse complex software systems in terms of their data model, state model, and more.
5. Understand the software engineering life cycle in the context of modern and iterative software development practices in order to elicit requirements, design systems thoughtfully, and implement software correctly.
6. Demonstrate an understanding of how to use version control and continuous integration to sustainably integrate code from multiple parties.

## 🌈 1. Overview

UNSW has been having severe issues with lecture attendance - student's just aren't coming to class, and they're citing that class isn't interesting enough for them.

UNSW must resort to giving into the limited attention span of students and gamify lecture and tutorial time as much as possible - by doing interactive and colourful quizzes.

However, instead of licensing well-built and tested software, UNSW is hoping to use the pool of extremely talented and interesting COMP1531 students to create their own version to distribute around campus for free. The chosen game to "take inspiration from" is **<a href="https://kahoot.com/">Kahoot</a>**.

The 24T2 cohort of COMP1531 students will build the **backend Javascript server** for a new quiz game platform, **Toohak**. We plan to task future students to build the frontend for Toohak, something you won't have to worry about.

**Toohak** is the questionably-named quiz tool that allows admins to create quiz games, and players to join (without signing up) to participate and compete.

We have already specified a **common interface** for the frontend and backend to operate on. This allows both courses to go off and do their own development and testing under the assumption that both parties will comply with the common interface. This is the interface **you are required to use**.

The specific capabilities that need to be built for this project are described in the interface at the bottom. This is clearly a lot of features, but not all of them are to be implemented at once.

(For legal reasons, this is a joke).

We highly recommend **creating and playing** a Kahoot game to better understand your task:
- To sign up and log in as an admin, go to [kahoot.com](https://kahoot.com/).
- To join a game created by an admin, go to [kahoot.it](https://kahoot.it/).

## 🐭 2. Iteration 0: Getting Started

[You can watch the iteration 0 introductory video here.](https://youtu.be/81r1oUQHRNA) This video is not required watching (the specification is clear by itself) though many students find it useful as a starting point.

### 🐭 2.1. Task

This iteration is designed as a warm-up to help you setup your project, learn Git and project management practises (see Marking Criteria), and understand how your team works together.

In this iteration, you are expected to:
1. Write stub code for the basic functionality of Toohak. The basic functionality is defined as the `adminAuth*`, `adminQuiz*` capabilities/functions, as per the interface section below (2.2).
    * A stub is a function declaration and sample return value (see example below). **Do NOT write the implementation** for the stubbed functions. That is for the next iteration. In this iteration you are just focusing on setting up your function declarations and getting familiar with Git.
    * Each team member must stub **AT LEAST 1** function each.
    * Function stub locations should be inside files named a corresponding prefix e.g. `adminQuiz*` inside `quiz.js`.
    * Return values should match the interface table below (see example below).
```javascript
// Sample stub for the authLoginV1 function
// Return stub value matches table below
function adminAuthLogin(email, password) {
  return {
    authUserId: 1,
  }
}
```
2. Design a structure to store all the data needed for Toohak, and place this in the [code block](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) inside the `data.md` file. Specifically, you must consider how to store information about **users** and **quizzes** and populate ONE example `user` and `quiz` in your data structure (any values are fine - see example below).
    * Use the interface table (2.2) to help you decide what data might need to be stored. This will require making some educated guesses about what would be required to be stored in order to return the types of data you see. **Whilst the data structure you describe in data.md might be similar to the interface, it is a different thing to the interface.** If you're still confused, think of the interface like a restaurant menu, and `data.md` like where the food is stored in the back. It's all the same food, but the menu is about how it's packaged up and received from the kitchen, and `data.md` is describing the structure of how it's all stored behind the scenes. 
    * As functions are called, this structure would be populated with more users and quizzes, so consider this in your solution.
    * Focus on the structure itself (object/list composition), rather than the example contents.
```javascript
// Example values inside of a 'user' object might look like this
// NOTE: this object's data is not exhaustive, you may need more/fewer fields stored as you complete this project. 
{
  uId: 1,
  nameFirst: 'Rani',
  nameLast: 'Jiang',
  email: 'ranivorous@gmail.com',
}
```

3. Follow best practices for git and teamwork as discussed in lectures.
    * Create a group contract by completing `contract.md` - you may add/edit this template as you see fit.
    * You are expected to have **at least 1 meeting** with your group, and document the meeting(s) in meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting). We have provided you with a `minutes-template.md` which you may use if you choose.
    * For this iteration each team member will need to make a minimum of **1 merge request per person** in your group into the `master` branch.
    * **1 merge request per function** must be made (11 in total).
    * Check out the lab on Git from week 1 to get familiar with using Git.

### 🐭 2.2. Functions to stub

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`, `oldPassword`, `newPassword`.

The following are integers: `authUserId`, `quizId`.

In terms of file structure:
 * All functions starting with `adminAuth` or `adminUser` go in `auth.js`.
 * All functions starting with `adminQuiz` go in `quiz.js`.
 * `clear` goes in `other.js`.

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a user with an email, password, and names, then returns their <code>authUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  authUserId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered user's email and password returns their <code>authUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  authUserId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetails</code>
      <br /><br />
      Given an admin user's authUserId, return details about the user.
      <li>"<code>name</code>" is the first and last name concatenated with a single space between them.</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ user:
  {
    userId: 1,
    name: 'Hayden Smith',
    email: 'hayden.smith@unsw.edu.au',
    numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1,
  }
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetailsUpdate</code>
      <br /><br />
      Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, email, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizList</code>
      <br /><br />
      Provide a list of all quizzes that are owned by the currently logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ quizzes: [
    {
      quizId: 1,
      name: 'My Quiz',
    }
  ]
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizCreate</code>
      <br /><br />
      Given basic details about a new quiz, create one for the logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, name, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  quizId: 2
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizRemove</code>
      <br /><br />
      Given a particular quiz, permanently remove the quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizInfo</code>
      <br /><br />
      Get all of the relevant information about the current quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  quizId: 1,
  name: 'My Quiz',
  timeCreated: 1683125870,
  timeLastEdited: 1683125871,
  description: 'This is my quiz',
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizNameUpdate</code>
      <br /><br />
      Update the name of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId, name )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>()</code> no parameters
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
</table>

### 🐭 2.3 Marking Criteria
<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Implementation)</td>
    <td>40%</td>
    <td><ul>
      <li>Correct implementation of specified stubs.</li>
    </ul></td>
  </tr>
  <tr>
  <tr>
    <td>Documentation</td>
    <td>20%</td>
    <td><ul>
      <li>Clear and obvious effort and time gone into thinking about possible representation of data structure for the project containing users and quizzes, inside of <code>data.md</code>.</li>
    </ul></td>
  </tr>
  <tr>
    <td>Git Practices</td>
    <td>30%</td>
    <td><ul>
      <li>Meaningful and informative git commit messages being used (see <a href="https://initialcommit.com/blog/git-commit-messages-best-practices#:~:text=commit%20message%20style.-,General%20Commit%20Message%20Guidelines,-As%20a%20general">examples</a>).</li>
      <li>Effective use of merge requests (from branches being made) across the team (as covered in lectures).</li>
      <li>At least 1 merge request per person and 1 merge request per function (11 in total) made into the <code>master</code> branch.</li>
    </ul></td>
  </tr>
  <tr>
    <td>Project Management & Teamwork</td>
    <td>10%</td>
    <td><ul>
      <li>Completed group contract.</li>>
      <li>A generally equal contribution between team members.</li>
      <li>Effective use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online.</li>
      <li>Had a meeting together that involves planning and managing tasks, and taken notes from said meeting (and stored in a logical place in the repo e.g. Wiki section).</li>
    </ul></td>
  </tr>
</table>

### 🐭 2.4. Dryrun

We have provided a dryrun for iteration 0 consisting of one test for each function. Passing these tests means you have a correct implementation for your stubs, and have earned the marks for the automarking component iteration 0.

To run the dryrun, you should on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) be in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 0
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~cs1531/bin/iter0.test.js
```

### 🐭 2.5. Submission

Please see section 6 for information on **due date**.

## 🐶 3. Iteration 1: Basic Functionality and Tests

Coming Soon.

## 🐝 4. Iteration 2: Building a Web Server

Coming Soon.

## 🦆 5. Iteration 3: Completing the Lifecycle

Coming Soon.

## 🌸 6. Due Dates and Weightings

| Iteration | Due date                             | Demonstration to tutor(s)     | Assessment weighting (%) |
| --------- | ------------------------------------ | ----------------------------- | ------------------------ |
| 0         | 8pm Friday  7th Jun (**week 2**)    | No demonstration              | 5% of project mark       |
| 1         | 8pm Friday 21st Jun (**week 4**)    | In YOUR **week 5** laboratory | 30% of project mark      |
| 2         | 8pm Friday 12th Jul (**week 7**)    | In YOUR **week 8** laboratory | 35% of project mark      |
| 3         | 8pm Friday 2nd Aug (**week 10**)    | Final demonstration week 11   | 30% of project mark      |

For more information about demonstrations see section `6.2`.

### 🌸 6.1. Submission & Late Penalties

To submit your work, simply have your master branch on the gitlab website contain your groups most recent copy of your code. I.E. "Pushing to master" is equivalent to submitting. When marking, we take the most recent submission on your master branch that is prior to the specified deadline for each iteration.

The following late penalties apply depending on the iteration:
 * Iteration 0: No late submissions at all.
 * Iteration 1: No late submissions at all.
 * Iteration 2: No late submissions at all.
 * Iteration 3: Can submit up to 48 hours late, with 5% penalty applied off your mark every time a 24 hour window passes, starting from the due date.

We will not mark commits pushed to master after the final submission time for a given iteration.

If the deadline is approaching and you have features that are either untested or failing their tests, **DO NOT MERGE IN THOSE MERGE REQUESTS**. In some rare cases, your tutor will look at unmerged branches and may allocate some reduced marks for incomplete functionality, but `master` should only contain working code.

Minor isolated fixes after the due date are allowed but may carry a penalty to the automark. If the isolated fixes result in a higher automark result (minus the penalty), then we will update your mark. E.g. imagine that your initial automark is 20%, on re-run you get a raw automark of 86%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 86% to 60%, your final **automark** will still be 60%.

If the re-run automark after penalty is lower than your initial mark, we will keep your initial mark. E.g. imagine that your initial automark is 50%, on re-run you get a raw automark of 70%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 70% to 49%, your final **automark** will still be 50% (i.e. your initial mark).

#### How to request a re-run

* Create a branch, e.g. `iter[X]-fix`, based off the submission commit.
* Make the minimal number of necessary changes (i.e. only fix the trivial bugs that cost you many automarks).
* Create a merge request for this branch, and take note of merge request ID in the URL
  * It is the number at the end of the URL
  * "https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/H17B_CRUNCHIE/project-backend/-/merge_requests/**67**"
* Log onto the [project runs page](https://cgi.cse.unsw.edu.au/~cs1531/NOW/content/project/runs) and submit that merge request ID (e.g. 67) for rerun
* Once you submit it, it will take up to 24 hours for you to receive the results of the rerun.
  * The results will appear in status "reviewing", which means an admin still needs to review the penalty.
  * **Please note: The results of the rerun is your RAW automark BEFORE ANY penalties have been applied.**
* Once your MR has been reviewed (this can take up to 72 hours), the status will change to "Complete" and the result will be updated to the mark after penalty
* If the mark after penalty is higher than your current mark, this will then be updated in the grade system, and take 48 hours to propagate to you.

Please note: The current limit on reruns is one every 24 hours. You can submit multiple re-runs before waiting for manual review or mark propagation, as long as they are 24 hours apart.

##### What constitutes a "trivial fix”?
* Fixing spelling/capitalisation/naming issues with values specified in spec documentation
* Swapping a variable type e.g. token from 'number' to 'string'
* Changing the return value type e.g. returning {} rather than null, to match spec documentation
* Changing route versions e.g. v1 to v2 to match spec documentation
* Fixing import values
* Fixing a regex/logical equality check e.g. num === 0 to num === 1
* Fixing constant variable values e.g. loginAttempts = 1 to loginAttempts = 0
* As a general rule, any change that is < 3 lines of code

### 🌸 6.2. Demonstration

#### Iteration 1 & 2 Demonstrations

The demonstrations in weeks 5 and 8 will take place during your lab sessions. All team members **must** attend these lab sessions. Team members who do not attend a demonstration may receive a mark of 0 for that iteration. If you are unable to attend a demonstration due to circumstances beyond your control, you must apply for special consideration.

Demonstrations consist of a 15 minute Q&A in front of your tutor and potentially some other students in your tutorial. For online classes, webcams and audio are required to be on during this Q&A (your phone is a good alternative if your laptop/desktop doesn't have a webcam).

#### Iteration 3 Demonstration

For Iteration 3, you will be demonstrating your work in week 11.

This will consist of a 10 minute presentation and Q&A with 1-2 tutors.

Any member of your group can nominate a time for the final presentation [here](https://cgi.cse.unsw.edu.au/~cs1531/NOW/content/project/final-presentation). The time of your presentation must be selected from this list.

If you are in an in-person tutorial, your week 11 presentation will be in-person. If you are in an online tutorial, your week 11 presentation will be online.

More information about the details of this 10 minute presentation will be made available in the iteration 3 part of the spec.

## 👌 7. Individual Contribution

The marks given to you for each iteration are given to you individually. We do however use group marks (e.g. automarking) to infer this, and in many cases, you may receive the same mark as your group members, particularly in cases with well functioning groups. Your individual mark is determined by a combination of the factors below by your tutor, with your group mark as a reference point.Your tutor will look at the following items each iteration to determine your mark:
 * Project check-in
 * Code contribution
 * Tutorial contributions
 * Peer assessment

In general, all team members will receive the same mark (a sum of the marks for each iteration), **but if you as an individual fail to meet these criteria, your final project mark may be scaled down**, most likely quite significantly.

### 👌 7.1. Project check-in

During your lab class, you and your team will conduct a short standup in the presence of your tutor. Each member of the team will briefly state what they have done in the past week, what they intend to do over the next week, and what issues they have faced or are currently facing. This is so your tutor, who is acting as a representative of the client, is kept informed of your progress. They will make note of your presence and may ask you to elaborate on the work you've done.

Project check-ins are also excellent opportunities for your tutor to provide you with both technical and non-technical guidance.

Your attendance and participation at project check-ins will contribute to your individual mark component for the project. In addition, your tutor will note down any absences from team-organised standups.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

The following serves as a baseline for expected progress during project check-ins, in the specified weeks. For groups which do not meet this baseline, teamwork marks and/or individual scaling may be impacted.
| Iteration | Week/Check-in | Expected progress                                                                                                                                     |
| --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | **Week 2**    | Twice-weekly standup meeting times organised, iteration 0 specification has been discussed in a meeting, at least 1 task per person has been assigned |
| 1         | **Week 3**    | Iteration 1 specification has been discussed in a meeting, at least 1 task per person has been assigned                                               |
| 1         | **Week 4**    | 1x function per person complete (tests and implementation in master)                                                                                  |
| 2         | **Week 5**    | Iteration 2 specification has been discussed in a meeting, at least 1 task per person has been assigned                                               |
| 2         | **Week 6**    | **(Checked by your tutor in week 7)** Server routes for all iteration 1 functions complete and in master                                              |
| 2         | **Week 7**    | 1x iteration 2 route per person complete (HTTP tests and implementation in master)                                                                    |
| 3         | **Week 8**    | Iteration 3 specification has been discussed in a meeting, at least 1 task per person has been assigned                                               |
| 3         | **Week 9**    | Exceptions & tokens in HTTP headers added across the project AND 1x iteration 3 route per person complete (HTTP tests and implementation in master)                            |
| 3         | **Week 10**    | 2x iteration 3 routes per person complete (HTTP tests and implementation in master)                            |

### 👌 7.2. Tutorial contributions

From weeks 2 onward, your individual project mark may be reduced if you do not satisfy the following:
* Attend all tutorials.
* Participate in tutorials by asking questions and offering answers.
* [online only] Have your web cam on for the duration of the tutorial and lab.

We're comfortable with you missing or disengaging with 1 tutorial per term, but for anything more than that please email your tutor. If you cannot meet one of the above criteria, you will likely be directed to special consideration.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

### 👌 7.3. Code contribution

All team members must contribute code to the project to a generally similar degree. Tutors will assess the degree to which you have contributed by looking at your **git history** and analysing lines of code, number of commits, timing of commits, etc. If you contribute significantly less code than your team members, your work will be closely examined to determine what scaling needs to be applied.

Note that **contributing more code is not a substitute for not contributing documentation**.

Please also note that **failure to commit (as an individual) at least once in each week of your iteration may result in up to a 20% mark penalty**. It's critical that you at least demonstrate you can make minor progress each week. If this were an individual assignment we would not enforce this, but given it is a group assignment it's important we encourage you to commit regularly.

### 👌 7.4. Documentation contribution

All team members must contribute documentation to the project to a generally similar degree.

In terms of code documentation, your functions are required to contain comments in JSDoc format, including paramters and return values:

```javascript
/**
  * <Brief description of what the function does>
  * 
  * @param {data type} name - description of paramter
  * @param {data type} name - description of parameter
  * ...
  * 
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/
```

In each iteration you will be assessed on ensuring that every relevant function in the specification is appropriately documented.

In terms of other documentation (such as reports and other notes in later iterations), we expect that group members will contribute equally.

Note that, **contributing more documentation is not a substitute for not contributing code**.

### 👌 7.5. Peer Assessment

**Please note: Failure to complete a peer review for a particular iteration may result in a mark penalty of 10% for the iteration**

At the end of each iteration, there will be a peer assessment survey where you will rate and leave comments about each team member's contribution to the project up until that point. 

Your other team members will **not** be able to see how you rated them or what comments you left in either peer assessment. If your team members give you a less than satisfactory rating, your contribution will be scrutinised and you may find your final mark scaled down.

<table>
  <tr>
    <th>Iteration</th>
    <th>Link</th>
    <th>Opens</th>
    <th>Closes</th>
  </tr>
  <tr>
    <td>1</td>
    <td>Coming soon</td>
    <td>8pm Friday 21st June</td>
    <td>9am Monday 24th June</td>
  </tr>
  <tr>
    <td>2</td>
    <td>Coming soon</td>
    <td>8pm Thursday 12th July</td>
    <td>9am Monday 15th July</td>
  </tr>
  <tr>
    <td>3</td>
    <td>Coming soon</td>
    <td>8pm Friday 2nd August</td>
    <td>9am Monday 5th August</td>
  </tr>
</table>

### 👌 7.6. Managing Issues

When a group member does not contribute equally, we are aware it can implicitly have an impact on your own mark by pulling the group mark down (e.g. through not finishing a critical feature), etc.

The first step of any disagreement or issue is always to talk to your team member(s) on the chats in MS Teams. Make sure you have:
1. Been clear about the issue you feel exists.
2. Been clear about what you feel needs to happen and in what time frame to feel the issue is resolved.
3. Gotten clarity that your team member(s) want to make the change.

If you don't feel that the issue is being resolved quickly, you should escalate the issue by talking to your tutor with your group in a project check-in, or alternatively by emailing your tutor privately outlining your issue.

It's imperative that issues are raised to your tutor ASAP, as we are limited in the mark adjustments we can do when issues are raised too late (e.g. we're limited with what we can do if you email your tutor with iteration 2 issues after iteration 2 is due).

## 💻 8. Automarking & Leaderboard

### 💻 8.1. Automarking

Each iteration consists of an automarking component. The particular formula used to calculate this mark is specific to the iteration (and detailed above).

When running your code or tests as part of the automarking, we place a 90 second timer on the running of your group's tests. This is more than enough time to complete everything unless you're doing something very wrong or silly with your code. As long as your tests take under 90 seconds to run, you don't have to worry about it potentially taking longer when we run automarking.

### 💻 8.2. Pre-submission Leaderboard

In the days preceding iterations 1, 2, and 3's due date, we will be running your code against the actual automarkers (the same ones that determine your final mark) and publishing the results of every group on the [marking runs page](https://cgi.cse.unsw.edu.au/~cs1531/NOW/content/project/runs). You will get to see the current mark (within a range) of your submission, as well as how your group ranks within the cohort. You will not receive any elaboration on how that mark was determined - if your mark isn't what you expect, work with your group and/or tutor to debug your code and write more tests.

You must have the code you wish to be tested in your `master` branch by **10pm** the night before leaderboard runs.

The leaderboard will be updated on Monday, Wednesday, and Friday morning during the week that the iteration is due.

This leaderboard run gives you a chance to sanity check your automark (without knowing the details of what you did right and wrong), and is just a bit of fun.

## 👀 9. Plagiarism

The work you and your group submit must be your own work. Submission of work partially or completely derived from any other person or jointly written with any other person is not permitted. The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Relevant scholarship authorities will be informed if students holding scholarships are involved in an incident of plagiarism or other misconduct.

Do not provide or show your project work to any other person, except for your group and the teaching staff of COMP1531. If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted, you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

Note: you will not be penalized if your work has the potential to be taken without your consent or knowledge.
