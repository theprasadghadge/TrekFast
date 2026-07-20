import Trek from "../model/Trek.js";

// Add a new Trek (Organizer)
export const addTrek = async (req, res) => {
  try {
    const {
      trekName,
      location,
      state,
      description,
      difficulty,
      duration,
      distance,
      altitude,
      startingPoint,
      endingPoint,
      startDate,
      endDate,
      meetingTime,
      maxParticipants,
      price,
      includes,
      excludes,
      organizerName,
      organizerEmail,
      organizerPhone,
      imageUrl,
    } = req.body;

    const newTrek = new Trek({
      trekName,
      location,
      state,
      description,
      difficulty,
      duration,
      distance,
      altitude,
      startingPoint,
      endingPoint,
      startDate,
      endDate,
      meetingTime,
      maxParticipants,
      price,
      includes,
      excludes,
      organizerName,
      organizerEmail,
      organizerPhone,
      imageUrl,
    });

    await newTrek.save();

    res.status(201).json({ message: "Trek added successfully!", trek: newTrek });
  } catch (err) {
    console.error("Add Trek Error:", err);
    res.status(500).json({ message: "Server error. Could not add trek." });
  }
};

// Get all active Treks (Trekker view)
export const getAllTreks = async (req, res) => {
  try {
    const treks = await Trek.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(treks);
  } catch (err) {
    console.error("Get Treks Error:", err);
    res.status(500).json({ message: "Server error. Could not fetch treks." });
  }
};

// Get treks by organizer email
export const getOrganizerTreks = async (req, res) => {
  try {
    const { email } = req.params;
    const treks = await Trek.find({ organizerEmail: email }).sort({ createdAt: -1 });
    res.status(200).json(treks);
  } catch (err) {
    console.error("Get Organizer Treks Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete a trek
export const deleteTrek = async (req, res) => {
  try {
    const { id } = req.params;
    await Trek.findByIdAndDelete(id);
    res.status(200).json({ message: "Trek deleted successfully." });
  } catch (err) {
    console.error("Delete Trek Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// Update/Edit a trek
export const updateTrek = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTrek = await Trek.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedTrek) return res.status(404).json({ message: "Trek not found." });
    res.status(200).json({ message: "Trek updated successfully.", trek: updatedTrek });
  } catch (err) {
    console.error("Update Trek Error:", err);
    res.status(500).json({ message: "Server error. Could not update trek." });
  }
};
