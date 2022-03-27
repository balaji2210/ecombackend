exports.cookieToken = (user, res) => {
  const token = user.getJwt();
  res.cookie("token", token, {
    httpOnly: true,
  });
  user.password = undefined;
  return res.status(200).json({
    success: true,
    token,
    user,
  });
};
