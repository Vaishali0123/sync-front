import { createSlice } from "@reduxjs/toolkit";

const signedupSlice = createSlice({
  name: "signup",
  initialState: {
    email: "",
    image: null,
    password: "",
    name: "",
    organisationlist: [],
    url: "",
  },
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setImage: (state, action) => {
      state.image = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setOrganisationList: (state, action) => {
      state.organisationlist = action.payload;
    },
    setUrl: (state, action) => {
      state.url = action.payload;
    },
  },
});
export const { setEmail, setImage, setName, setPassword, setOrganisationList } =
  signedupSlice.actions;
export default signedupSlice.reducer;
