// import { useMemo, useState } from "react";
// import DraggableStory from "@dnd-kit/core";

// export const Board = () => {
//   const [gridSize, setGridSize] = useState(30);
//   const style = {
//     alignItems: "flex-start",
//   };
//   const buttonStyle = {
//     marginLeft: gridSize - 20 + 1,
//     marginTop: gridSize - 20 + 1,
//     width: gridSize * 8 - 1,
//     height: gridSize * 2 - 1,
//   };
//   const snapToGrid = useMemo(() => createSnapModifier(gridSize), [gridSize]);

//   return (
//     <>
//       <DraggableStory
//         label={`Snapping to ${gridSize}px increments`}
//         modifiers={[snapToGrid]}
//         style={style}
//         buttonStyle={buttonStyle}
//         key={gridSize}
//       />
//       <Grid size={gridSize} onSizeChange={setGridSize} />
//     </>
//   );
// };
