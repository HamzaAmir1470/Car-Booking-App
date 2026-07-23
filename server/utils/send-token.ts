import jwt from "jsonwebtoken";

export const sendToken = async (user: any, res: any) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "30d" },
  );

  return res.status(200).json({
    success: true,
    accessToken,
    user,
  });
};
