const express = require("express");
const Notes = require("../models/Notes");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

//Route 1 : Get all the notes using: GET "/api/notes/fetchallnotes". doesn't require Auth .

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id }); //fetching all notes from id .
    res.json(notes);
  } catch (error) {
    console.error(errors);
    res.status(500).json({ errors: "server Error" });
  }
});

//Route 2 : Add a new note  using: POST "/api/notes/addnote". Login required.

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valiud title").isLength({ min: 5 }), //validation
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }), //validation
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //if there is any error, return Bad request and the errors
      const errors = validationResult(req); //Error code
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } //Error code

      //adding a new note
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.error(errors);
      res.status(500).json({ errors: "server Error" });
    }
  }
);

//Route 3 : Update a existing note  using: PUT "/api/notes/updatenote". Login required.

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body; //destructuring and usnig our notes components.

  try {
    // create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the note to be updated and updatde it
    let note = await Notes.findById(req.params.id); // finding notes by ID
    if (!note) {
      return res.status(404).send("Not found");
    } // checking notes exist or not

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    } //checking that this particular note belong to the same user who created that note .

    //for existing note
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(errors);
    res.status(500).json({ errors: "server Error" });
  }
});

//Route 3 : deleteing a existing note  using: delete "/api/notes/deltenote". Login required.

router.delete("/deltenote/:id", fetchuser, async (req, res) => {
  try {
  //Find the note to be deleted and delete it
  let note = await Notes.findById(req.params.id); // finding notes by ID
  if (!note) {
    return res.status(404).send("Not found");
  } // checking notes exist or not

  //allow deletion only if user owns this note
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not allowed");
  }

  //for existing note
  note = await Notes.findByIdAndDelete(req.params.id);
  res.json({ Success: "Note has been deleted", note: note });
} catch (error) {
  console.error(errors);
  res.status(500).json({ errors: "server Error" });
}
});

module.exports = router;
