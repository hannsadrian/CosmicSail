<style global>
  @import url('https://fonts.googleapis.com/css2?family=Dosis:wght@400;700&display=swap');

  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  .font-dosis {
    font-family: "Dosis", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  }

  .h-9 {
    height: 2.25rem;
  }

  ::selection {
    background: #1444ff; /* WebKit/Blink Browsers */
    color: white;
  }
  ::-moz-selection {
    background: #1444ff; /* Gecko Browsers */
    color: white;
  }

  :focus {
    outline: none;
  }

  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 15px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
  }
</style>
