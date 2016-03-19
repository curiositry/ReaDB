# ReaDB: Your Private Digital Bookshelf

**ReaDB is a privacy-aware, self-hosted, open-source alternative to propriatary services like GoodReads and LibraryThing.**

![ReaDB Demo Screenshot](https://s3.amazonaws.com/drp.io/files/w12/VJHSVoITg/Screenshot%20from%202016-01-30%2013:30:57.png)

## An FAQ of sorts

1. **Who is ReaDB for?**
Me. Anyone who reads more than five books a year, and wants to remember what they learned from them.

2. **Why did you build this thing? Why not use Goodreads, or LibraryThing, or ____?**
I do use Goodreads but I don’t *use* Goodreads. I don’t *use* Goodreads, even though I have an account because Goodreads does too many things and doesn’t do them well enough. I don’t care about buying books and having friends and all that. I care about me and my books and what I learned from them. And Goodreads knows more about my books and what I learned from them than it tells me. It doesn’t respect my privacy, and it’s owned by Amazon, which would like to sell me more books even if I wouldn’t learn anything from them. Or even read them. <br><br>That’s the same reason I have accounts with RocketReads and other library apps and haven’t added my books to them. They give me too many features that are neat and not enough that are useful; they take too much of my personal information. <br><br> I built ReaDB to be exactly what I was looking for.

3. **What does ReaDB do?**
It lets you find your books and keep a handle on what you’ve read about what when and what you thought about it.

4. **How do I use ReaDB?**
You add your books, and ReaDB automatically gets more data about your books than you can remember, by querying the Google Books API (if you let it). You can import lots of books at a time or add them as you read them. It’s pretty simple, and if you don’t like it you can always export your data and move on.

That’s it. ReaDB is open source. You can use the hosted version if you want, or you can host your own instance. It’s built with Meteor and bunch of other stuff:

- Install meteor and login
- Clone the repo: `git clone https://github.com/Curiositry/ReaDB`
- Enter directory with `cd readb`
- Rename `settings.exmaple.json` to `settings.json` and enter your Mandrill API credentials to allow it to send email verifications.
- Start meteor: `meteor --settings settings.json`. You should have a fully functional ReaDB instance at [http://localhost:3000](http://localhost:3000)
- (Optional) deploy with `meteor deploy your-readb-instance.meteor.com`