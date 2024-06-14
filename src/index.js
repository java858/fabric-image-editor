import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./global.css";
import styles from "./index.css";
import { fabric } from "fabric";
import img1 from "./images/img-1.png";
import img2 from "./images/img-2.png";

// basic configs for canvas
const cvsConfig = {
  width: 700,
  height: 500,
};

/**
 * A fabric.js demo.
 */
const App = () => {
  const [canvas, setCanvas] = useState(null); // canvas, the container
  const [textInput, setTextInput] = useState(""); // text to be drawn onto canvas
  const [imgPreviewSrc, setImgPreviewSrc] = useState(""); //src of the image uploaded from local disk
  const fileInputRef = useRef(null); // input to carry the uploaded image
  const [nameInput, setNameInput] = useState(""); // name of picture when save canvas as a png file
  const [stepBox, setStepBox] = useState([]); // step box for undo and redo
  const [wsNameInput, setWsNameInput] = useState(""); // workspace name
  const [wsList, setWsList] = useState([]); // workspace list
  const [selectedWsId, setSelectedWsId] = useState(undefined); // selected workspace id for restoring
  const [isDrawingMode, setIsDrawingMode] = useState(false); // switch for free draw
  const [drawingOptions, setDrawingOptions] = useState({
    color: "black", // line color
    lineWidth: 5, // line width
  }); // other options for free draw

  useEffect(() => {
    // init stuff
    initCanvas();
    initWsList();
  }, []);

  // initiate fabric canvas object
  const initCanvas = () => {
    const cvs = new fabric.Canvas("myCanvas");
    setCanvas(cvs);
  };

  // re-render all in canvas, serves as a refresh
  const renderAll = () => {
    canvas.renderAll();
  };

  // set target object active on canvas
  const setActive = (obj) => {
    if (obj) canvas.setActiveObject(obj);
  };

  // draw shape onto canvas
  const drawShape = (type = "rectangle") => {
    let shape = null;
    switch (type) {
      case "circle":
        shape = new fabric.Circle({
          left: 200,
          top: 50,
          radius: 25,
          fill: "green",
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          left: 100,
          top: 150,
          width: 80,
          height: 80,
          fill: "red",
        });
        break;
      case "strange":
        // shape = new fabric.Path(
        //   "M 185.636 372.915 C 196.331 371.992 211.227 369.878 230.352 366.674 C 245.718 365.283 259.005 367.383 270.154 372.915 C 288.339 381.345 301.605 397.43 309.956 421.148 C 321.132 451.917 319.087 487.104 303.728 526.685 C 289.674 562.106 273.916 585.853 256.193 597.939 C 247.295 604.032 230.976 608.953 207.259 612.625 C 177.426 617.758 153.247 618.482 134.592 614.719 C 100.081 608.712 74.479 590.064 57.7 558.833 C 34.919 515.515 26.483 476.892 32.56 442.848 C 39.052 411.156 57.238 388.297 87.049 374.337 C 107.571 365.04 125.694 362.222 141.602 365.978 C 163.94 371.049 178.606 373.392 185.636 372.915 Z",
        //   {
        //     fill: "red",
        //     selectable: true,
        //   }
        // );
        shape = new fabric.Path(
          "M 4 8 L 10 1 L 13 0 L 12 3 L 5 9 C 6 10 6 11 7 10 C 7 11 8 12 7 12 A 1.42 1.42 0 0 1 6 13 A 5 5 0 0 0 4 10 Q 3.5 9.9 3.5 10.5 T 2 11.8 T 1.2 11 T 2.5 9.5 T 3 9 A 5 5 90 0 0 0 7 A 1.42 1.42 0 0 1 1 6 C 1 5 2 6 3 6 C 2 7 3 7 4 8 M 10 1 L 10 3 L 12 3 L 10.2 2.8 L 10 1",
          {
            fill: "red",
            selectable: true,
          }
        );
        shape.scaleToWidth(200);
        break;
      default:
        shape = new fabric.Rect({
          left: 300,
          top: 50,
          fill: "blue",
          width: 100,
          height: 100,
        });
        break;
    }

    canvas.add(shape);
    setActive(shape);
    renderAll();
  };

  // draw text onto canvas
  const drawText = (fontFamily = "impact") => {
    const text = new fabric.Text(textInput || "Hello, World!", {
      left: 50,
      top: 50,
      fontFamily,
      fontSize: 30,
      fill: "red",
    });
    canvas.add(text);
    setActive(text);
    renderAll();
  }; // draw image onto canvas

  const drawImage = (_img = img1, scaleX = 1, scaleY = 1) => {
    fabric.Image.fromURL(_img, (img) => {
      img.set({
        scaleX,
        scaleY,
      });
      img.setPositionByOrigin(
        new fabric.Point(cvsConfig.width / 2, cvsConfig.height / 2),
        "center",
        "center"
      );
      canvas.add(img);
      setActive(img);
      renderAll();
    });
  }; // trigger image upload event

  const uploadImg = () => {
    fileInputRef.current?.click();
  }; // handle image uploaded from local to canvas

  const onImgFileChange = () => {
    const imgFile = fileInputRef.current?.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(imgFile);
    reader.onload = function (e) {
      setImgPreviewSrc(reader.result);
      drawImage(reader.result); // draw it onto canvas
    };
  }; // clear everything on canvas

  const clearCanvasContainer = () => {
    canvas.clear();
    setImgPreviewSrc("");
    fileInputRef.current?.form?.reset();
    setTextInput("");
    setNameInput("");
    setWsNameInput("");
    setSelectedWsId(undefined);
    setIsDrawingMode(false);
    setStepBox([]);
  }; // delete active object in the canvas

  const deleteActiveObj = () => {
    canvas.remove(canvas.getActiveObject());
  }; // save canvas as a picture to local disk

  const save = () => {
    const link = document.createElement("a"),
      transform = canvas.viewportTransform.slice();
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    link.href = canvas.toDataURL();
    canvas.viewportTransform = transform;
    link.download = `${nameInput || Date.now()}.png`;
    link.click();
  }; // name for saving canvas as a picture to local disk

  const handleNameInputChange = (event) => {
    setNameInput(event.target.value);
  }; // back one step

  const undo = () => {
    if (canvas._objects.length > 0) {
      canvas.discardActiveObject();
      setStepBox((prev) => {
        const obj = canvas._objects.pop();
        renderAll();
        return [...prev, obj];
      });
    }
  }; // forward one step

  const redo = () => {
    if (stepBox.length > 0) {
      canvas.discardActiveObject();
      setStepBox((prev) => {
        const _prev = [...prev],
          obj = _prev.pop();
        canvas.add(obj);
        return _prev;
      });
    }
  }; // load all the workspace saved

  const initWsList = () => {
    try {
      let arr = [];
      const str = localStorage.wsList;
      if (str) {
        arr = JSON.parse(str);
      }
      setWsList(arr);
    } catch (error) {
      alert(error);
    }
  }; // save workspace to localStorage, simulate save to database

  const saveWorkspace = () => {
    const id = Date.now(),
      ws = {
        id,
        name: wsNameInput || id,
        canvas: canvas.toJSON(),
      };
    setWsList((prev) => {
      const arr = [...prev, ws];
      localStorage.wsList = JSON.stringify(arr);
      return arr;
    });
    setWsNameInput("");
    alert("workspace saved");
  }; // name for workspace to be saved

  const handleWsNameInputChange = (event) => {
    setWsNameInput(event.target.value);
  }; // select which workspace to restore

  const handleWsSelect = (event) => {
    setSelectedWsId(event.target.value);
  }; // restore workspace saved previously

  const retoreWorkspace = () => {
    if (!selectedWsId || !wsList.length)
      return alert("no workspace is selected or stored!");
    const ws = wsList.find((e) => e.id === +selectedWsId);
    if (ws?.canvas) {
      canvas.loadFromJSON(ws.canvas);
    }
  }; // turn on and off free draw mode

  const switchFreeDraw = () => {
    const _isDrawingMode = !isDrawingMode;
    setIsDrawingMode(_isDrawingMode);
    canvas.isDrawingMode = _isDrawingMode;
    if (_isDrawingMode) {
      canvas.freeDrawingBrush.color = drawingOptions.color;
      canvas.freeDrawingBrush.width = drawingOptions.lineWidth;
    }
  }; // free draw color change

  const handleColorChange = (color) => {
    setDrawingOptions((prevOptions) => ({
      ...prevOptions,
      color,
    }));
    canvas.freeDrawingBrush.color = color;
  }; // free draw line width change

  const handleLineWidthChange = (width) => {
    setDrawingOptions((prevOptions) => ({
      ...prevOptions,
      lineWidth: width,
    }));
    canvas.freeDrawingBrush.width = width;
  }; // input changes for text rendering

  const handleInputChange = (event) => {
    setTextInput(event.target.value);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controlBox}>
        <div className={styles.category}>
          <button onClick={clearCanvasContainer}>Clear</button>
          <button onClick={deleteActiveObj}>Delete Active</button>
        </div>
        <div className={styles.category}>
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
        </div>
        <div className={styles.category}>
          <button
            onClick={() => {
              drawShape();
            }}
          >
            Rectangle
          </button>
          <button onClick={() => drawShape("circle")}>Circle</button>
          <button
            onClick={() => {
              drawShape("triangle");
            }}
          >
            Triangle
          </button>
          <button
            onClick={() => {
              drawShape("strange");
            }}
          >
            Strange
          </button>
        </div>
        <div className={styles.category}>
          <input
            type="text"
            value={textInput}
            onChange={handleInputChange}
            placeholder="Input the text"
          />
          <button
            className={styles.textImpact}
            onClick={() => {
              drawText();
            }}
          >
            Text Impact
          </button>
          <button
            className={styles.textCursive}
            onClick={() => {
              drawText("cursive");
            }}
          >
            Text cursive
          </button>
        </div>
        {/* <div className={styles.category}>
          <img
            src={img1}
            className={styles.imgBtn}
            onClick={() => {
              drawImage(undefined, 0.2, 0.2);
            }}
          />
          <img
            src={img2}
            className={styles.imgBtn}
            onClick={() => {
              drawImage(img2, 0.2, 0.2);
            }}
          />
        </div> */}
        <div className={styles.category}>
          <button onClick={uploadImg}>Upload image</button>
          <form>
            <input ref={fileInputRef} type="file" onChange={onImgFileChange} />
          </form>
          {imgPreviewSrc && (
            <img
              className={`${styles.imgBtn} ${styles.imgPreview}`}
              src={imgPreviewSrc}
            />
          )}
        </div>
        <div className={styles.category}>
          <button onClick={switchFreeDraw}>
            Free Draw {isDrawingMode ? "ON" : "OFF"}
          </button>
          <input
            type="color"
            value={drawingOptions.color}
            onChange={(e) => handleColorChange(e.target.value)}
          />
          <input
            type="range"
            min="1"
            max="20"
            value={drawingOptions.lineWidth}
            onChange={(e) => handleLineWidthChange(Number(e.target.value))}
          />
        </div>
        <div className={styles.category}>
          <button onClick={save}>Save to PNG</button>
          <input
            type="text"
            placeholder="Input file name here"
            value={nameInput}
            onChange={handleNameInputChange}
          />
        </div>
        <div className={styles.category}>
          <button onClick={saveWorkspace}>Save Workspace</button>
          <input
            type="text"
            value={wsNameInput}
            onChange={handleWsNameInputChange}
            placeholder="Input workspace name"
          />
          <select value={selectedWsId} onChange={handleWsSelect}>
            <option value={undefined} />
            {wsList.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <button onClick={retoreWorkspace}>Restore Workspace</button>
        </div>
      </div>
      <div className={styles.canvasBox}>
        <canvas
          id="myCanvas"
          width={cvsConfig.width}
          height={cvsConfig.height}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
