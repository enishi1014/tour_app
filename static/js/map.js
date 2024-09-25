const apiKey = "v1.public.eyJqdGkiOiIzODVjMGU5OS00NDI4LTQyZmMtOTY4ZS02OWVkYjI1Y2QxMWEifSYNGsUw2rs7pgeRhhpCtTFHWZw3xQpY4QxGIiAIoC6Uz62F6Y1YRhJ08z9B1HG7tdcLApNZqeK-mpXFGZJ3mcNliJRh_TeIvp5Ci8BZIr_qD9NJUXHSEoPqDTKAWD72QAMjvDl31aOhpcLI-0g8K-JmP8Zhb01fjblMmHVWFU-VtrEpJ__1JYLGAd0W42gC-0kJmWXucvfx4qR41-cxCN21zYUAUL6TBfvy1qRrKCkyJsP_qHIbl3otPSs1C08jHtOiac35ryRc91JrBfq2IB6maFJ6yAnL-WWRgJjYniA4zaOYhI-MtBrm18VahqbFGSriZtNpbHTdyReCZSQGym4.ZTA2OTdiZTItNzgyYy00YWI5LWFmODQtZjdkYmJkODNkMmFh";
const mapName = "mymap";
const region = "ap-southeast-2";

const map = new maplibregl.Map({
  container: "map",
  style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
  center: [139.6917, 35.6895],
  zoom: 11,
});

const bounds = [
  [139.5603, 35.5233], 
  [139.9086, 35.8185]  
];
map.setMaxBounds(bounds);
map.addControl(new maplibregl.NavigationControl(), "top-left");

