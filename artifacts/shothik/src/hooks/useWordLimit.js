import { useSelector } from "react-redux";

const useWordLimit = (service) => {
  const { user, userLimit } = useSelector((state) => state.auth);

  const freePack = user?.package === "free" || !user?.email;
  const starterPack = user?.package === "starter";
  const premiumPack = user?.package === "premium";

  const defaultLimit = freePack
    ? 1500
    : starterPack
      ? 3000
      : premiumPack
        ? 10000
        : 1500;

  const limitArray = Array.isArray(userLimit) ? userLimit : [];
  const starter = limitArray.find(
    (x) => x["type"] === (user?.package || "free"),
  );
  const starterLimit = starter?.pricing_features?.find(
    (f) => f["type"] === service,
  )?.word_limit;

  return {
    wordLimit: starterLimit || defaultLimit,
  };
};

export default useWordLimit;
