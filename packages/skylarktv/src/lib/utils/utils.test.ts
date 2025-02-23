import { DimensionKey, Dimensions, ImageUrls } from "../interfaces";
import { graphQLClient } from "../skylark";
import {
  formatReleaseDate,
  getTitleByOrder,
  sortArrayIntoAlphabeticalOrder,
  sortObjectByNumberProperty,
  getImageSrcAndSizeByWindow,
  skylarkRequestWithDimensions,
  addCloudinaryOnTheFlyImageTransformation,
} from "./utils";

jest.mock("../../constants/env", () => ({
  CLOUDINARY_ENVIRONMENT: "CLOUDINARY_ENVIRONMENT",
}));

describe("utils", () => {
  describe("getImageSrcAndSizeByWindow", () => {
    const imageUrls: ImageUrls = {
      isExpanded: true,
      items: [
        {
          self: "/api/image/1",
          url: "https://skylark.com/images/1.jpg",
          urlPath: "/images/1.jpg",
          type: "Thumbnail",
        },
        {
          self: "/api/image/2",
          url: "https://skylark.com/images/2.jpg",
          urlPath: "/images/2.jpg",
          type: "Main",
        },
      ],
    };

    const { window } = global;
    afterEach(() => {
      global.window = window;
    });

    it("returns image without size if window is undefined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete global.window;
      const src = getImageSrcAndSizeByWindow(imageUrls, "Main");
      expect(src).toEqual("https://skylark.com/images/2.jpg");
    });

    it("returns image with size set to window innerWidth as it is larger than innerHeight", () => {
      window.innerWidth = 200;
      window.innerHeight = 100;
      window.dispatchEvent(new Event("resize"));
      const src = getImageSrcAndSizeByWindow(imageUrls, "Main");
      expect(src).toEqual("https://skylark.com/images/2-200x200.jpg");
    });

    it("returns image with size set to window innerHeight as it is larger than innerWidth", () => {
      window.innerWidth = 100;
      window.innerHeight = 200;
      window.dispatchEvent(new Event("resize"));
      const src = getImageSrcAndSizeByWindow(imageUrls, "Main");
      expect(src).toEqual("https://skylark.com/images/2-200x200.jpg");
    });
  });

  describe("skylarkRequestWithDimensions", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it("makes a request without additional headers when time travel is empty", async () => {
      jest.spyOn(graphQLClient, "request");
      (graphQLClient.request as jest.Mock).mockImplementation(() => {});

      const dimensions: Dimensions = {
        [DimensionKey.TimeTravel]: "",
        [DimensionKey.DeviceType]: "",
        [DimensionKey.CustomerType]: "",
        [DimensionKey.Language]: "",
        [DimensionKey.Region]: "",
      };

      await skylarkRequestWithDimensions("query", dimensions);

      expect(graphQLClient.request).toHaveBeenCalledWith(
        "query",
        {},
        {
          "x-language": "",
          "x-sl-dimension-customer-types": "",
          // "x-sl-dimension-device-types": "",
          // "x-sl-dimension-regions": "",
        },
      );
    });

    it("makes a request and adds the time travel header when its populated", async () => {
      jest.spyOn(graphQLClient, "request");
      (graphQLClient.request as jest.Mock).mockImplementation(() => {});

      const dimensions: Dimensions = {
        [DimensionKey.TimeTravel]: "next week",
        [DimensionKey.DeviceType]: "",
        [DimensionKey.CustomerType]: "",
        [DimensionKey.Language]: "",
        [DimensionKey.Region]: "",
      };

      await skylarkRequestWithDimensions("query", dimensions);

      expect(graphQLClient.request).toHaveBeenCalledWith(
        "query",
        {},
        {
          "x-time-travel": "next week",
          "x-language": "",
          "x-sl-dimension-customer-types": "",
          // "x-sl-dimension-device-types": "",
          // "x-sl-dimension-regions": "",
        },
      );
    });
  });

  describe("getTitleByOrder", () => {
    it("returns the short title as its given as the type and all titles are valid", () => {
      const titles = {
        title: "long",
        title_short: "short",
      };
      const title = getTitleByOrder(titles, ["title_short", "title"]);
      expect(title).toEqual("short");
    });

    it("returns the long title as its given as the type and all titles are valid", () => {
      const titles = {
        title: "long",
        title_short: "short",
      };
      const title = getTitleByOrder(titles, ["title", "title_short"]);
      expect(title).toEqual("long");
    });

    it("returns the long title even though it is lowest priority as short and medium are both empty", () => {
      const titles = {
        title: "long",
        title_short: "",
      };
      const title = getTitleByOrder(titles, ["title_short", "title"]);
      expect(title).toEqual("long");
    });

    it("returns an empty string when all TitleTypes are empty", () => {
      const titles = {
        title: "",
        title_short: "",
      };
      const title = getTitleByOrder(titles, ["title_short", "title"]);
      expect(title).toEqual("");
    });

    it("returns an empty string when a valid title exists but it is not in the priority array", () => {
      const titles = {
        title: "long",
        title_short: "",
      };
      const title = getTitleByOrder(titles, ["title_short"]);
      expect(title).toEqual("");
    });

    it("returns the objectTitle when no titles are valid and an objectTitle is given", () => {
      const titles = {
        title: "",
        title_short: "",
      };
      const title = getTitleByOrder(
        titles,
        ["title_short", "title"],
        "objectTitle",
      );
      expect(title).toEqual("objectTitle");
    });

    it("returns the objectTitle when the titles are undefined", () => {
      const title = getTitleByOrder(
        undefined,
        ["title_short", "title"],
        "objectTitle",
      );
      expect(title).toEqual("objectTitle");
    });
  });

  describe("formatReleaseDate", () => {
    const date = "2000-01-01";

    it("returns date in the default format when a format isn't given", () => {
      const formattedDate = formatReleaseDate(date);
      expect(formattedDate).toEqual("January 1, 2000");
    });

    it("returns date in the default format when the date has a timezone and a format isn't given", () => {
      const formattedDate = formatReleaseDate("2000-01-01+00:50");
      expect(formattedDate).toEqual("January 1, 2000");
    });

    it("returns date in the given format when a format is given", () => {
      const formattedDate = formatReleaseDate(date, "en-gb", "YYYY");
      expect(formattedDate).toEqual("2000");
    });

    it("returns empty string when date is undefined", () => {
      const formattedDate = formatReleaseDate(undefined);
      expect(formattedDate).toEqual("");
    });

    it("translates release date to the given locale", () => {
      const formattedDate = formatReleaseDate(date, "pt-pt");
      expect(formattedDate).toEqual("janeiro 1, 2000");
    });
  });

  describe("sortObjectByNumberProperty", () => {
    const arr = [
      { number: 10 },
      { number: 1 },
      { number: 5 },
      { number: 4 },
      { number: 5 },
    ];

    it("sorts the objects by the number property", () => {
      const got = arr.sort(sortObjectByNumberProperty);
      expect(got).toEqual([
        { number: 1 },
        { number: 4 },
        { number: 5 },
        { number: 5 },
        { number: 10 },
      ]);
    });
  });

  describe("sortArrayIntoAlphabeticalOrder", () => {
    const arr = ["bananas", "apples", "peach", "Car", "AVOCADO"];

    it("sorts the array of strings into alphabetical order", () => {
      const got = arr.sort(sortArrayIntoAlphabeticalOrder);
      expect(got).toEqual(["apples", "AVOCADO", "bananas", "Car", "peach"]);
    });
  });

  describe("addCloudinaryOnTheFlyImageTransformation", () => {
    it("correctly prefixes with cloudinary url for Skylark S3 (https)", () => {
      const got = addCloudinaryOnTheFlyImageTransformation(
        "https://media.skylarkplatform.com/skylarkimages/ss77sbncbrdvjknaaws4hsksse/01J58D5JDQN646VXX2V8A205GX/01J58DKSVKABCMEMEM44Y23BTN",
        { width: 400 },
      );
      expect(got).toEqual(
        "https://res.cloudinary.com/CLOUDINARY_ENVIRONMENT/image/fetch/w_400/https://media.skylarkplatform.com/skylarkimages/ss77sbncbrdvjknaaws4hsksse/01J58D5JDQN646VXX2V8A205GX/01J58DKSVKABCMEMEM44Y23BTN",
      );
    });

    it("correctly prefixes with cloudinary url for Skylark S3 (http)", () => {
      const got = addCloudinaryOnTheFlyImageTransformation(
        "http://media.skylarkplatform.com/skylarkimages/ss77sbncbrdvjknaaws4hsksse/01J58D5JDQN646VXX2V8A205GX/01J58DKSVKABCMEMEM44Y23BTN",
        { width: 400 },
      );
      expect(got).toEqual(
        "https://res.cloudinary.com/CLOUDINARY_ENVIRONMENT/image/fetch/w_400/http://media.skylarkplatform.com/skylarkimages/ss77sbncbrdvjknaaws4hsksse/01J58D5JDQN646VXX2V8A205GX/01J58DKSVKABCMEMEM44Y23BTN",
      );
    });

    it("does nothing when already prefixed", () => {
      const got = addCloudinaryOnTheFlyImageTransformation(
        "https://res.cloudinary.com/CLOUDINARY_ENVIRONMENT/image/fetch/w_400/https://media.skylarkplatform.com/skylarkimages/ss77sbncbrdvjknaaws4hsksse/01J58D5JDQN646VXX2V8A205GX/01J58DKSVKABCMEMEM44Y23BTN",
        { width: 600 },
      );
      expect(got).toEqual(
        "https://res.cloudinary.com/CLOUDINARY_ENVIRONMENT/image/fetch/w_400/https://media.skylarkplatform.com/skylarkimages/ss77sbncbrdvjknaaws4hsksse/01J58D5JDQN646VXX2V8A205GX/01J58DKSVKABCMEMEM44Y23BTN",
      );
    });

    it("correctly adds resizing when url is already cloudinary", () => {
      const got = addCloudinaryOnTheFlyImageTransformation(
        "http://res.cloudinary.com/CLOUDINARY_ENVIRONMENT/image/upload/v1729261701/ej0qkuprpwqnspdoaxsj.jpg",
        { height: 400 },
      );
      expect(got).toEqual(
        "http://res.cloudinary.com/CLOUDINARY_ENVIRONMENT/image/upload/h_400/v1729261701/ej0qkuprpwqnspdoaxsj.jpg",
      );
    });
  });
});
