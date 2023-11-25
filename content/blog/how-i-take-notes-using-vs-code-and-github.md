---
title: 'How I take Notes using VS Code and GitHub'
description: 'I have used dozens of note-taking apps, read lots and lots of hacker news threads on how different people organize their notes and finally settled on VS Code as the editor and GitHub Repo as the storage.'
publishedAt: 2020-05-26T16:07:25+00:00
---

Here is how I did it and let's see what’s good and what's bad about this setup.

## GitHub Setup

I got this whole idea when GitHub made private repo free for personal use. I simply created a private repo, cloned it to local for offline access.

Now, I just have to push to the repo whenever I make a change to my files. I know it would lead to many unnecessary commits but if I want I can squash commits anytime.

![Screenshot of Github Page](/images/how-i-take-notes-using-vs-code-and-github-2.png)

Be sure to clone it locally to take notes on.

## VS Code Setup

Now to the editor, I like to write my notes on markdown format cause it's easily parsable on the web and it's easy to write it.

I already use VS Code for development and it has a sweet markdown viewer, so we will be using that for editing the notes.

![Screenshot of VS Code Markdown Editor](/images/how-i-take-notes-using-vs-code-and-github-8.png)

And I also use these extensions:

[**Code Spell Checker**](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

[**markdownlint**](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

Markdown linter is not really necessary but it does help when you are learning markdown for the first time.

[**Run on Save**](https://marketplace.visualstudio.com/items?itemName=pucelle.run-on-save)

This helps in pushing the markdown files to git whenever you save it. After installing this extention, in VS code settings.json, add this:

```json
{
  "runOnSave.commands": [
    {
      "match": "{{ path_to_folder }}.md$",
      "command": "pushnotes",
      "runIn": "terminal"
    }
  ]
}
```

Here the `pushnotes` command executes in the terminal whenever a save occurs. And now in your `bash_profile` add these lines:

```sh
pushnotes() {
  cd && cd projects/notes
  now=$(date '+%A %d %m %Y %X')
  git add . -v
  git commit -a -s -v -m $now
  git push -v
}
```

These will push your code to GitHub with the time and date as the commit messsage. So now, whenever you save a file, you push to the repository.

## Automator Setup (Only on Mac)

After some days, I noticed that starting up VS Code and going to my notes folder was taking a lot of time, precious seconds that I could spend watching Netflix.

So I made a automator script to open my notes in VS Code with a keyboard shortcut from any application.

![Screenshot of Menu Bar with Shortcuts](/images/how-i-take-notes-using-vs-code-and-github-1.png)

You can reproduce it by:

1. Open Automator App
2. Create New Quick Action

   ![Screenshot of New Quick Action](/images/how-i-take-notes-using-vs-code-and-github-3.png)

3. Change `Workflow receives current` to no input in any application

   ![Screenshot of Workflow receives current](/images/how-i-take-notes-using-vs-code-and-github-4.png)

4. Drag Run Shell Script from the sidebar to the workflow pane

   ![Screenshot of Run Shell Script](/images/how-i-take-notes-using-vs-code-and-github-5.png)

5. Add `opennotes` to the text box

   ![Screenshot of text box](/images/how-i-take-notes-using-vs-code-and-github-6.png)

6. Now go to System Preferences > Keyboard > Shortcuts and Services in the left pane. Find the service you just created, it should be under General.

   ![Screenshot of System Preferences](/images/how-i-take-notes-using-vs-code-and-github-7.png)

7. You should see add shortcut when you hover over it, I have used `CMD + SHIFT + '` as my shortcut.

8. And finally add this code to your `bash_profile` to actually open VS code:

```sh
alias opennotes='cd && cd projects/notes && code .'
```

## Pros of this setup

- Offline Access
- No new apps needed
- Own your data
- Everything is open source, no need for any unreliable branded apps.

## Cons of this Setup

- No mobile access, you can view GitHub on the web. But editing is not that great.
- Limited to markdown, I miss notion blocks.

## I love it so far...

I've been using this setup for 2 months and I love it so far, but I don't know how long I can go without editing on my mobile or iPad. For now I've been adding tasks in Todoist and copying to my notes when I'm on my laptop.

So there are few problems, but in this moment I'm happy with this.
