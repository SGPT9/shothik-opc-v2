

import { useEffect } from "react";
import {
  useGetUserLimitQuery,
  useGetUserQuery,
} from "@/redux/api/auth/authApi";
import { hydrateAuth } from "@/redux/slices/auth";
import { useDispatch, useSelector } from "react-redux";

const AuthApplier = () => {
  const dispatch = useDispatch();
  // ⚡ Bolt: Destructuring auth state causes unnecessary re-renders when other auth fields change. Use specific selectors.
  const accessToken = useSelector((state) => state.auth?.accessToken);
  const _hydrated = useSelector((state) => state.auth?._hydrated);

  useEffect(() => {
    if (!_hydrated) {
      dispatch(hydrateAuth());
    }
  }, [dispatch, _hydrated]);

  useGetUserQuery(undefined, {
    skip: !accessToken,
  });
  useGetUserLimitQuery();

  return null;
};

export default AuthApplier;
