# How We Think About Civic Tech and Coding Without a Coding Background

MUSA at Penn is a unique program. I love it because it has empowered many of my dreams. I have loved the courses I have taken and the courses I have TAed, and some of my happiest moments at Penn have come from conversations with our faculty, about research, teaching, coding, careers, and questions that often wandered far beyond the syllabus. Elizabeth called it a daily question.

This essay is my attempt to reflect on what I have observed as a student, a TA, and sometimes as co-teacher. Teaching coding is hard. Teaching coding to students without a technical background is even harder. But it is also deeply rewarding. When I see someone has no coding background can developed an app as the end of one year program, I feel deep satisfaction even though I may only contribute a little bit.

What I want is for every student in these courses to experience some of the excitement I have found in coding: the satisfaction of making something work, the curiosity that comes from discovering a new tool, the persistence that develops through debugging, and eventually the confidence to say, “I have never done this before, but I know how to start.”

That aspiration has led me to a more difficult question:

**What are we actually trying to teach when we teach coding, civic technology, and computational methods to students who do not come from a coding background?**

Are we trying to teach Python? GeoPandas? R? JavaScript? Machine learning? Cloud computing? AI? Or are these tools through which we are trying to teach something more durable?

And that created blind spots.

## I Did Not Learn Coding Because Someone Taught Me Everything

My first experience with coding was *Python for Everybody* on Coursera. It was entirely through self-motivation.
I wanted to know how my computer worked behind the scenes, *which I eventually realized was not really what that course was about.*

I would say I learned almost nothing, just a tiny taste of what coding was. The course materials are old now, but they have helped generations of people understand the basic syntax of Python.

I completed the basic assignments and proudly told my parents that I knew Python. But I was still super far from actually knowing it, as I realized later. I did not know what a package was or why we needed to import one. I was just copying sample code, searching online, or following other tutorials. No one teached me how to get started or offer me direct answer to my question.


I went back to Python basics repeatedly over the next several years. Some concepts I looked at four or five times before they finally became intuitive. Loops, functions, objects, environments, package structures—many of these things did not become clear because someone explained them perfectly once.

I struggled a lot, but I thought that was just part of the process of learning and coding. I messed up folders and file directories. I misspelled a column name. But no one told me how to solved those problems, it all through experiement and self-explortory.

Years later, I realized this is called **debugging**:

If a piece of code failed, I broke it apart.

If one explanation made no sense, I searched for another.

I looked at YouTube videos, Stack Overflow posts, documentation, GitHub repositories, blog posts, course websites, example notebooks, and whatever else I could find.

I have spent entire evenings debugging a single Python error. I could sit down at 6:00 p.m., encounter an error, and still be working on that same problem at 12:30 a.m.

Not because anyone required me to.

I just wanted to figure it out.

For a long time, I assumed this was normal.

Teaching made me realize that it is not.

## My First Blind Spot: I Thought Everyone Would Explore

I am naturally very willing to explore.

Before I come to Penn, I have no knowledge of R. But, I am eager to learn it. I finished the datacamp assigned by professor by three days consecutive persistent which required to complete in a semester.

When I encounter a new package, I rarely think, “Nobody taught me this.”

My instinct is closer to:

**There must be something online. Let me find it.**

But broken materials and tutorial are super normal.

For me, a broken tutorial is not necessarily a failed learning experience. Sometimes it is a better learning experience.

Maybe the API changed.

Maybe the package version changed.

Maybe the environment is wrong.

Maybe the example depends on a file structure I do not have.

Maybe the code itself is bad.

Every one of those possibilities teaches me something about how software works.

I eventually realized that I had been taking this mindset for granted.

Many students do not automatically think this way.

When they encounter a problem, they may not know what the next move is.

They may not know how to formulate a useful search query.

They may not know how to read documentation.

They may not know whether the problem is the code, the environment, the data, the file path, the package version, or the underlying logic.

During my observation, sometimes the workflow looks like this:

write a large block of code → run → error → stop.



## Struggle Is Not the Problem

No one succeeds in the first few rounds. My coding instinct taught me that lesson: never expect to work through a process perfectly the first time when you have never done it before.

This is where I started disagreeing with one common response to students struggling with technical courses.

The immediate instinct is often:

**We need to explain more. We need to slow down. We need to make the code easier.**

Sometimes that is true.

But sometimes struggle is part of the curriculum. I went through Python basics at least five times before I could comfortably write Python independently. I struggled through the first four rounds before things finally started to click in the fifth.

Would you call those first four rounds an instructional failure?

Partly, maybe. But not entirely. 

I think without the first four rounds of failure I wouldn't be success in the fifth rounds.

AI think without the first four rounds of failure, I would not have succeeded in the fifth round.

Almost nobody sees a loop once and suddenly becomes fluent in loops.

Nobody learns functions because an instructor explained functions clearly for twenty minutes.

Nobody memorizes the NumPy API.

Programming develops through repeated encounters with partial understanding.

You copy.

You modify.

You break something.

You try again.

You forget syntax.

You look it up.

Eventually, patterns become familiar.

The progression is often something like:

**copy → modify → explain → debug → adapt → create**


## A Coding Course Should Teach Students What to Do When the Code Does Not Work

One of the things I say most often when helping students is:

**Do not put so much code in one block.**

Why?

Because if thirty lines fail, how do you know where the problem is?

Run five lines.

Inspect the output.

Then run the next five.

Print an intermediate object.

Check its type.

Check its columns.

Check its shape.

Test one function separately.

Programming is an experimental process.

You do not need to know whether something will work before you run it.

In fact, one of the most important computational habits is:

**I do not know what this will do. Let me test it.**

Many beginners behave as though every line of code must be correct before they are allowed to execute it.

But coding is one of the cheapest experimental environments we have.

Try it.

Break it.

Inspect it.

Change it.

Try again.

I increasingly think that this process should be taught explicitly. We should not always show students perfectly working code. Break something. Make something not work. Then show them how you debug it.

## Documentation Is Part of Programming

Another thing that surprised me as a TA is how often students know a package but do not know where the package comes from.

They know GeoPandas.

But do they know how to find GeoPandas documentation?

Do they know how to read a method signature?

Do they understand what parameters are optional?

Do they know what the function returns?

Do they know the difference between:

```python
gpd.read_file(...)
```

and:

```python
gdf.to_crs(...)
```

Why is one called from the module and the other from the object?

What kind of object is `gdf`?

What does `.to_crs()` return?

These are not obscure tricking questions, they are the beginning of understanding an API.

Yet many technical courses rely heavily on sample code.

The student begins to think:

**My job is to find the example that looks most similar to the assignment.**

Then programming becomes template matching and copying and pasting.

The student does not ask:

**What operation do I need?**

Instead, they ask:

**Which old notebook contains something that looks like this?**

That works until the problem changes.


## How Technical Path Dependence Begins

Suppose a student learns spatial analysis through GeoPandas.

The course gives GeoPandas examples.

The assignments use GeoPandas.

The student completes several projects with GeoPandas.

Soon the student's mental model becomes:

**spatial vector analysis = GeoPandas**

But what happens when GeoPandas is inefficient for the problem?

What happens when the dataset becomes too large?

What happens when a database solution would be better?

If the student has only learned a tool, the student keeps trying to force the problem into the tool.

The initial tool choice creates familiarity.

Familiarity creates repetition.

Repetition reduces exploration.

Eventually, the student stops asking whether the tool is still appropriate.

This is why I believe that technical courses should not teach tools as destinations.

They should teach students how to **discover, evaluate, and replace tools**.

GeoPandas is not “how spatial programming works.”

It is one implementation within a much larger ecosystem.

## The Courses That Changed How I Learned

Two of the most influential technical courses in my own learning were Qiusheng Wu's GIS programming courses. Dr. Wu is a well-known professor in the geospatial coding world. When he started sharing his class videos online, I followed them. He had worked at Binghamton when I started there, but unfortunately I never had the chance to take his class in person.

What I liked about these courses was that they went far beyond teaching packages. They taught me how to think more like a programmer and an analyst.

Before trying to expose students to every possible spatial application, the courses spent substantial time on things that may appear almost boring:

Git.

VS Code.

Miniconda.

environments.

file management.

version control.

package structures.

documentation.

Jupyter.

reproducibility.

This is how I started to understand why I had failed so much before. I understood the syntax, but I never really understood how Python worked behind the scenes.

But they answer a deeper question:

**How does this whole computational world fit together?**

Once you understand that a package is just a package—something written, documented, versioned, installed, and maintained by people—the package becomes much less mysterious.

If I encounter something new, I know where to start.

Find the documentation.

Find the repository.

Understand the object model.

Run the minimum example.

Change one thing.

See what breaks.

That logic transfers.


## The Difference Between Teaching Tools and Teaching Logic

This distinction became much clearer to me after taking and teaching several technical courses at Penn.

Public Policy Analytics, Python, JavaScript, Cloud Computing, and AI for Sustainability all involve technical learning.

But I increasingly confused:

**What is the terminal learning objective, and what is merely enabling knowledge?**

Take Public Policy Analytics for example:

The course may use R, tidyverse, regression, visualization, spatial methods, count models, logistic regression, machine learning, and other tools.

But the real purpose should not be that students remember `group_by()`.

The real purpose should be that students can reason about evidence.

What relationship are we trying to estimate?

What is the outcome variable?

What assumptions are we making?

What does the coefficient mean?

When does the model generalize?

When is the model inappropriate?

Yet for a beginner, the immediate struggle may become:

Why is `group_by()` written with an underscore?

Why is this pipe not working?

Why did Quarto fail to render?

Why is this column missing?

Why does `glm()` use this syntax?

Suddenly, the endpoint shifts.

Instead of:

**understand the analytical concept**

the experienced goal becomes:

**make the code run**

That is a serious pedagogical problem.

The enabling skill begins to hijack the learning objective.

## “Clean Notebook” Is Not a Formatting Requirement

I think the same issue appears when we teach students to produce a “clean notebook.”

What does clean mean?

Does it mean no errors?

Does it mean the code is nicely formatted?

Does it mean the markdown looks good?


In my opinion, this is not the the most important things to care about.

A clean notebook should reveal reasoning.

Why did this step happen before the next one?

Why was this intermediate dataset created?

Why was this variable transformed?

Why was the workflow separated into two stages?

Why did we save this output?

Why did we avoid loading the entire dataset at once?

When working with very large datasets, some of the most important decisions are not syntax decisions at all.

How much data should I load?

Should I filter before joining?

Should I batch the files?

Should I separate preprocessing from analysis?

Should I write intermediate results?

Is the bottleneck memory, CPU, or I/O?

Should I use pandas at all?

Those are computational reasoning questions.

Most of us learn them because something fails.

We run out of memory.

The computer freezes.

The process takes three hours.

A join explodes the dataset.

We redesign the workflow.

Then we understand.

Why should students be protected from every version of that experience?

## I Do Not Want Students to Avoid Failure

I want them to learn from it.

A technical course should not create the illusion that good programming means following a polished notebook from top to bottom without errors.

Real computational work does not look this way.

Real work contains:

syntax failures.

logic failures.

data failures.

environment failures.

memory failures.

workflow failures.

architecture failures.

reproducibility failures.

We should help students understand these and how to work with them.

If everything is simply described as “debugging,” students miss an important distinction.

Sometimes the bug is the code.

Sometimes the code is fine and the entire workflow is badly designed.

Sometimes the package is wrong for the scale.

Sometimes the tutorial is outdated.

Sometimes the data do not support the operation.

Students should experience enough failure to recognize these differences.

The point is not frustration for the sake of frustration. The point is diagnosis.

## What Would I Teach Instead?

If I designed a course, I might call it something like:

**Python for Spatial Exploration**

But the title could be misleading, because the course would not primarily be about spatial analysis.

It would be a course about computational thinking, using spatial problems as the context.

The first half of the semester would be deliberately slow.

We would talk about:

Git.

VS Code.

environments.

files and paths.

notebooks versus scripts.

package structure.

objects and methods.

documentation.

debugging.

incremental testing.

reproducibility.

basic pandas and GeoPandas through documentation explortory. 

But pandas and GeoPandas would not be the goal.

They would be teaching vehicles.

I would spend time showing students how documentation works.

I might give them:

```python
gdf = gdf.__________(__________)
```

and ask them to figure out what belongs there from the documentation.

Filling blanks is inherently educational, I didn't want to tricked them in a quiz using this format.

but because I want students to practice the full reasoning chain:

What do I need to do?

Which method performs that operation?

What object owns the method?

What parameters does it require?

What does it return?

How do I test whether it worked?

That is much closer to coding than copying a complete example.

## Then I Would Stop Teaching Packages

In the second half of the course, I would step away.

Students would choose two or three packages from a curated list.

Their job would not simply be to “learn package X.”

Their job would be to learn **how to learn package X**.

They would find the documentation.

Reproduce a basic example.

Adapt it.

Break it.

Debug it.

Compare it with an alternative.

Explain what the package is good at.

Explain what it is bad at.

Explain when they would not use it.

Then they would report back.

I would want to know:

What did you learn?

How did you learn it?

What went wrong?

How did you diagnose the problem?

Which documentation was useful?

What assumption did you initially misunderstand?

If you had to learn another package tomorrow, what would you do differently?

I want them to understand the basic workflow rather than remember which tools they used for which tasks.

I think this is the kind of knowledge that can remain even after they forget almost everything from the class 10 or 15 years later.

And maybe, by then, they can proudly say:

I may not remember the tool anymore, but I know how to find my way back.

## AI Makes This More Important, Not Less

AI changes the implementation of coding.

It does not eliminate the need for computational understanding.

I use AI heavily.

It dramatically increases my productivity.

But I have a fairly clear internal boundary about what I am willing to delegate.

If I need routine data cleaning, AI can help.

If I need a data summary, AI can help.

If I want a front-end component, AI can generate much of it.

But if I am building a cloud application, I want to understand how the front end and back end connect.

I want to understand the update logic.

I want to understand the architecture.

If I am building a statistical model, I need to understand the variables, assumptions, specification, and interpretation.

The code can be generated.

The judgment cannot be outsourced.

My rule is:

**Delegate execution; retain judgment.**

This is why I do not think AI-era technical education should revolve around whether students are “allowed” to use AI.

That is already becoming the wrong question.

The better question is:

**What must the student understand well enough to evaluate what the AI produced?**

That is a much more durable learning objective.

---

## The Problem of Quiet Students

Another question I still struggle with is why students can report substantial difficulty while asking so few questions.

I have seen this in Public Policy Analytics.

I have seen it in Python.

I have seen it in JavaScript.

I have seen it in AI-oriented courses.

Students say they are struggling.

But many do not come to office hours.

They do not ask in class.

They do not bring half-formed questions.

For me, this is difficult to relate to because I use office hours very differently.

I ask everything.

Career questions.

Research questions.

Teaching questions.

Questions about why a course was designed a certain way.

Questions about technical concepts that are not even part of the course.

I have gone to JavaScript office hours and spent time talking about topics that were never formally covered in the class.

Sometimes those conversations eventually influenced what appeared in the course.

I have always treated office hours as a place to think, not simply as a place to repair an assignment.

That is another blind spot.

Students may not know that office hours can work this way.

They may think they need a polished question.

They may think office hours are for students who are falling behind.

They may feel embarrassed because they cannot identify exactly what they do not understand.

Or AI may now absorb the first several rounds of confusion, allowing students to produce something that runs while delaying the moment when they realize they never understood the underlying structure.

If help-seeking is part of successful technical learning, then perhaps help-seeking itself needs to be taught.

## My Own Learning Was More Transferable Than I Realized

One of the hardest things for me to calibrate is that I transfer ideas very quickly.

When I first learned Web GIS and ArcGIS Online, I used them in an invasive species project.

When I learned participatory GIS and Kevin Lynch's framework, I immediately moved those ideas into a community mapping project in a nature preserve.

When I learned regression, I quickly encountered a research project with Erick where I had to think about whether regression was appropriate.

I did not consciously think:

“I am now practicing knowledge transfer.”

I just did it.

For years, I assumed students would naturally do the same.

Now I do not think they will.

Transfer has to be made visible.

Students should be asked:

What is the underlying idea here?

Where else could this be used?

If the software changed, what part of this workflow would remain?

If the data changed, what reasoning would still apply?

If you forgot the function name tomorrow, what would you still know?

This is what I increasingly want technical teaching to accomplish.

## What Should Students Retain?

This is the question I keep returning to.

Five years after my class, I do not care whether a student remembers the exact syntax of `group_by()`.

I do not care whether they remember the exact argument order of a GeoPandas method.

I do not care whether they remember the specific JavaScript library we used.

I care whether they can look at a new problem and ask:

What is the structure of this problem?

What data do I have?

What do I need as output?

What tool might fit?

How can I find out?

How do I test it?

How do I know whether the result is correct?

What assumptions am I making?

What should I do when the workflow fails?

That is what I want students to retain.

## The Goal Is Not To Produce Students Who Know More Tools

The goal is to produce students who are less dependent on the tools they already know.

That distinction matters.

Technical education can accidentally create dependency by teaching students a sequence of preferred tools without teaching them how to leave that sequence.

A student who knows ten packages but cannot learn the eleventh independently is not yet computationally independent.

A student who knows three packages but knows how to discover, evaluate, learn, debug, and replace tools may be much better prepared.

This is especially important in civic technology, urban analytics, planning, and public policy.

Our problems change.

Our datasets change.

Our scales change.

Our institutions change.

Our software will definitely change.

The durable skill is not knowing the current toolchain.

It is knowing how to enter an unfamiliar technical environment and begin reasoning.

## What I Want to Teach

The more I reflect on my own learning, the less interested I am in teaching students how to reproduce my code.

I want to teach them how to stop needing my code.

I want students to leave a technical course with a particular kind of confidence.

Not:

**I already know how to do this.**

But:

**I have never done this before, but I know how to start.**

To me, that is what technical education should ultimately produce.