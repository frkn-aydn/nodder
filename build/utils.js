const fs        =   require("fs");
const path      =   require("path");

exports.isHTML = (source) => {
    return path.extname(source) == ".html"
}

exports.getFiles = (source) => {
    return fs.readdirSync(source).map(name =>{
        return path.join(source, name)
    })
}