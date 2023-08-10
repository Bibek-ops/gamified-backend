const authGuard = require("../auth/auithGuard");
const Order = require("../models/enrollModel");
const Course = require("../models/productModel");

const router = require("express").Router();


//create order // enroll course

//

router.post("/create", async (req, res) => {
  console.log(req.body);
  const { cart, totalAmount, shippingAddress } = req.body;
  if (!cart || !totalAmount || !shippingAddress) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {

    const order = new Order({
      cart: cart,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      user: req.user.id
    })

    await order.save();
    res.json("Order created successfully");

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
});


router.post("/enroll_course/:id", authGuard, async (req, res) => {
  try {
    // Retrieve the request body data
    const { title, price, description, category, contend } = req.body;

    const { id } = req.params;
    // Create a new enrollment instance
    const newEnrollment = new Order({
      course: JSON.parse(contend),
      title,
      price,
      description,
      category,
      user: req.user.id,
    });

    // Save the new enrollment to the database
    await newEnrollment.save();
    console.log(newEnrollment);

    // Return the newly created enrollment as the response
    res.status(201).json(newEnrollment);
  } catch (error) {
    // Handle any errors that occurred during the process
    res.status(500).json({ message: error.message });
  }
});

router.get("/get_user_enroll_courses", authGuard, async (req, res) => {
  try {
    // Find all enrollments for the specified user
    const enrollments = await Order.find({ user: req.user.id })


    // Return the list of enrollments as the response
    res.status(200).json(enrollments);
  } catch (error) {
    // Handle any errors that occurred during the process
    res.status(500).json({ message: error.message });
  }
});

//get all couse contend
router.get("/get_single_couse/:id", authGuard, async (req, res) => {
  try {
    console.log(req.params.id);

    const content = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).select("course progress");

    res.json({
      content,
      progess: content.progress,
    });
    console.log(content);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
});

// updaet couse progess of user

router.put("/update_progress/:id", authGuard, async (req, res) => {
  try {
    // Retrieve the course ID from the request parameters
    const courseId = req.params.id;

    // Fetch the user's order containing the course
    const order = await Order.findOne({
      user: req.user.id,
      "course._id": courseId,
    });



    // If the order is not found or the user doesn't have access to it, return an error
    if (!order) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the course within the order's course array
    const course = order.course.find(
      (courseItem) => courseItem._id.toString() === courseId
    );

    // If the course is not found, return an error
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.complete === true) {
      course.complete = false;
      let completedCount = 0;
      order.course.forEach((courseItem) => {
        if (courseItem.complete) {
          completedCount++;
        }
      });

      // Calculate the overall progress as a percentage
      const progress = (completedCount / order.course.length) * 100;

      // Update the progress of each course object within the order
      order.progress = progress;

      // Save the updated order
      await order.save();

      return res.json({
        progress: order.progress,
        complete: order.course,
      });
    }

    // Set the completion status of the course to true
    course.complete = true;

    // Count the number of completed courses
    let completedCount = 0;
    order.course.forEach((courseItem) => {
      if (courseItem.complete) {
        completedCount++;
      }
    });

    // Calculate the overall progress as a percentage
    const progress = (completedCount / order.course.length) * 100;

    // Update the progress of each course object within the order
    order.progress = progress;

    // Save the updated order
    await order.save();

    console.log(order);

    // Send the updated course as the response
     res.json({
      progress: order.progress,
      complete: order.course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





router.get("/get_single", authGuard, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
});

router.get("/get_all", async (req, res) => {
  try {
    const orders = await Order.find({})
    res.json(orders)

  } catch (error) {
    res.json("Order Fetch Failed")
  }
})

// change order status
router.put("/change_status/:id", async (req, res) => {
  try {

    // find the order
    const order = await Order.findById(req.params.id);
    order.status = req.body.status;
    await order.save();
    res.json("Order status changed successfully");

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
})

module.exports = router;