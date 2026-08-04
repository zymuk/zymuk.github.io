import { playReminderSound } from "../../src/utils/sound";

describe("playReminderSound", () => {
  it("does nothing when Web Audio is not available", () => {
    delete window.AudioContext;
    expect(() => playReminderSound()).not.toThrow();
  });

  it("plays a chime when an audio context is available", () => {
    const oscillators = [];
    const context = {
      state: "running",
      currentTime: 0,
      destination: {},
      resume: jest.fn(),
      createOscillator: jest.fn(() => {
        const oscillator = {
          type: "",
          frequency: { setValueAtTime: jest.fn() },
          connect: jest.fn(),
          start: jest.fn(),
          stop: jest.fn(),
        };
        oscillators.push(oscillator);
        return oscillator;
      }),
      createGain: jest.fn(() => ({
        gain: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
      })),
    };
    window.AudioContext = jest.fn(() => context);

    playReminderSound();

    expect(oscillators).toHaveLength(6);
    oscillators.forEach((oscillator) => {
      expect(oscillator.connect).toHaveBeenCalled();
      expect(oscillator.start).toHaveBeenCalled();
    });
  });
});
