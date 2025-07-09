export const rootController = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is up",
    data: null,
  });
};