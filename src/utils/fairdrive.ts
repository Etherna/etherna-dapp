export const writePath = (directory: "root" | string) => {
  let writePath = ""
  if (directory == "root") {
    writePath = "/"
  } else {
    writePath = "/" + urlPath(directory) + "/"
  }
  return writePath
}

export const urlPath = (path: string) => {
  return path.replace(/&/g, "/")
}
