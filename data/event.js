module.exports = [
  {
    event: [
      {
        events: [
          {
            id: 1,
            name: "Shillong Autumn Festival",
            type: "Cultural",
            location: "Shillong",
            latitude: 25.574,
            longitude: 91.8832,
            dates: {
              start: "2023-11-10",
              end: "2023-11-12",
            },
            description:
              "Annual celebration of music, food and wine showcasing Khasi culture. Features local bands, handicraft markets and traditional dance performances.",
            highlights: [
              "Wine tasting sessions",
              "Rock music competitions",
              "Local food stalls",
            ],
            image: "events/autumn-festival.jpg",
            price: "₹500-2000",
            organizer: "Meghalaya Tourism Department",
            contact: "+91 9876543210",
            website: "www.shillongautumnfestival.com",
          },
          {
            id: 2,
            name: "Nongkrem Dance Festival",
            type: "Tribal",
            location: "Smit, Khasi Hills",
            latitude: 25.4921,
            longitude: 91.7773,
            dates: {
              start: "2023-11-15",
              end: "2023-11-17",
            },
            description:
              "Sacred Khasi harvest festival featuring the Ka Pomblang ceremony (goat sacrifice) and traditional dances by men in warrior costumes and women in silk dresses.",
            highlights: [
              "Pomblang ceremony",
              "Ka Shad Mastieh dance",
              "Traditional archery competition",
            ],
            image: "events/nongkrem-dance.jpg",
            price: "Free",
            note: "Photography restrictions during rituals",
          },
          {
            id: 3,
            name: "Cherrapunjee Monsoon Festival",
            type: "Seasonal",
            location: "Cherrapunjee",
            latitude: 25.2716,
            longitude: 91.7321,
            dates: {
              start: "2023-07-20",
              end: "2023-07-22",
            },
            description:
              "Celebration of the world's heaviest rainfall with waterfall treks, rain poetry sessions and local cuisine cooked in bamboo.",
            highlights: [
              "Waterfall rappelling",
              "Bamboo cooking workshop",
              "Cloud photography contest",
            ],
            image: "events/monsoon-fest.jpg",
            price: "₹300-1500",
            requirements: "Waterproof gear recommended",
          },
          {
            id: 4,
            name: "Dawki River Festival",
            type: "Adventure",
            location: "Dawki",
            latitude: 25.185,
            longitude: 92.0243,
            dates: {
              start: "2023-12-05",
              end: "2023-12-07",
            },
            description:
              "Celebration of the crystal-clear Umngot River with transparent kayaking competitions, fishing contests and riverside camping.",
            highlights: [
              "Boat races",
              "Underwater photography",
              "Night fishing",
            ],
            image: "events/dawki-festival.jpg",
            price: "₹800-3000",
            activities: [
              {
                name: "Kayaking",
                price: "₹500/hour",
              },
              {
                name: "Riverside camping",
                price: "₹1200/night",
              },
            ],
          },
          {
            id: 5,
            name: "Mawphlang Sacred Forest Ritual",
            type: "Spiritual",
            location: "Mawphlang Sacred Forest",
            latitude: 25.4479,
            longitude: 91.7789,
            dates: {
              recurring: "Every full moon",
            },
            description:
              "Ancient Khasi animist ceremony performed by the local lyngdoh (priest) to seek blessings from forest deities.",
            highlights: [
              "Egg divination",
              "Traditional animal sacrifice",
              "Herbal healing demonstrations",
            ],
            image: "events/sacred-forest.jpg",
            price: "Free (donations accepted)",
            restrictions: [
              "No photography during rituals",
              "No plastic allowed",
            ],
          },
          {
            id: 6,
            name: "Meghalaya Grassroots Music Festival",
            type: "Music",
            location: "Laitumkhrah, Shillong",
            latitude: 25.5723,
            longitude: 91.8832,
            dates: {
              start: "2023-10-28",
              end: "2023-10-29",
            },
            description:
              "Showcase of Northeast India's indie music scene across rock, blues and traditional folk genres.",
            highlights: [
              "Battle of bands",
              "Khasi folk fusion performances",
              "Guitar workshops",
            ],
            image: "events/music-fest.jpg",
            price: "₹300-1500",
            lineup: ["Soulmate", "Symphony Band", "The Vinyl Records"],
          },
          {
            id: 7,
            name: "Mawlynnong Cleanliness Drive",
            type: "Community",
            location: "Mawlynnong Village",
            latitude: 25.2067,
            longitude: 91.7123,
            dates: {
              recurring: "First Saturday of each month",
            },
            description:
              "Participate in Asia's cleanest village's community cleaning initiative using traditional bamboo tools.",
            highlights: [
              "Bamboo broom making",
              "Waste management workshop",
              "Organic farming demo",
            ],
            image: "events/cleanliness-drive.jpg",
            price: "Free",
            note: "Volunteers get free lunch",
          },
          {
            id: 8,
            name: "Cherrapunjee Trail Marathon",
            type: "Sports",
            location: "Cherrapunjee",
            latitude: 25.2671,
            longitude: 91.7316,
            dates: {
              start: "2023-12-17",
            },
            description:
              "Extreme trail running event through living root bridges, waterfalls and Khasi villages.",
            highlights: [
              "21km half marathon",
              "42km full marathon",
              "5km heritage walk",
            ],
            image: "events/trail-marathon.jpg",
            price: "₹1500-3500",
            categories: [
              {
                name: "Professional",
                entry_fee: "₹3500",
              },
              {
                name: "Amateur",
                entry_fee: "₹1500",
              },
            ],
          },
          {
            id: 9,
            name: "Shillong Christmas Festival",
            type: "Religious",
            location: "Police Bazar, Shillong",
            latitude: 25.574,
            longitude: 91.8826,
            dates: {
              start: "2023-12-20",
              end: "2023-12-25",
            },
            description:
              "Meghalaya's biggest Christmas celebration with midnight masses, carol singing and festive markets.",
            highlights: [
              "Cathedral choir performance",
              "Traditional Khasi Christmas feast",
              "Handicraft markets",
            ],
            image: "events/christmas-fest.jpg",
            price: "Free",
            special_events: [
              {
                date: "2023-12-24",
                name: "Midnight Mass at Cathedral",
              },
            ],
          },
          {
            id: 10,
            name: "Meghalaya Caving Expedition",
            type: "Adventure",
            location: "Jaintia Hills",
            latitude: 25.45,
            longitude: 92.2,
            dates: {
              start: "2023-11-25",
              end: "2023-11-30",
            },
            description:
              "Guided exploration of Krem Liat Prah - one of the world's longest cave systems with river passages.",
            highlights: [
              "Cave camping",
              "Fossil hunting",
              "Underground river crossing",
            ],
            image: "events/caving-expedition.jpg",
            price: "₹12,000-18,000",
            requirements: [
              "Basic fitness certificate",
              "Caving experience preferred",
            ],
          },
        ],
        metadata: {
          total_events: 10,
          categories: ["Cultural", "Tribal", "Adventure", "Music", "Seasonal"],
          last_updated: "2023-08-20",
        },
      },
    ],
  },
];
