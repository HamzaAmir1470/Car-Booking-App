import jwt from "jsonwebtoken";

export const sendToken = async (user: any, res: any) => {
  const accessToken = jwt.sign(
    { id: user.userId, email: user.email },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "30D" },
  );
  res.status(200).json({
    success: true,
    token: accessToken,
    user,
  });
};
