import { h, JSX, Fragment } from "preact";
import { MenuItemEditable } from "./menuItemEditable";
import { Exercise, IExercise } from "../models/exercise";
import { IUnit, IExerciseData, IExerciseDataValue } from "../types";
import { Weight } from "../models/weight";
import { IconCalculator } from "./icons/iconCalculator";
import { useState } from "preact/hooks";
import { Modal } from "./modal";
import { RepMaxCalculator } from "./repMaxCalculator";

interface IExerciseRMProps {
  name: string;
  rmKey: keyof IExerciseDataValue;
  exercise: IExercise;
  exerciseData: IExerciseData;
  units: IUnit;
  onEditVariable: (value: number) => void;
}

export function ExerciseRM(props: IExerciseRMProps): JSX.Element {
  let rm = props.exerciseData[Exercise.toKey(props.exercise)]?.[props.rmKey];
  rm = rm || (props.units === "kg" ? props.exercise.startingWeightKg : props.exercise.startingWeightLb);
  rm = Weight.convertTo(rm, props.units);
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <section data-cy="exercise-stats-1rm-set" className="px-4 py-1 mt-2 font-bold bg-purple-100 rounded-2xl">
      <MenuItemEditable
        type="number"
        name={props.name}
        isBorderless={true}
        onChange={(v) => {
          const value = v ? parseFloat(v) : undefined;
          if (value && !isNaN(value)) {
            props.onEditVariable(value);
          }
        }}
        value={`${rm.value}`}
        after={
          <>
            <span className="mr-2 font-normal text-grayv2-main">{rm.unit}</span>
            <button
              className="p-2 nm-show-rm-calculator"
              style={{ marginRight: "-0.25rem" }}
              onClick={() => setShowCalculator(true)}
            >
              <IconCalculator size={16} color="#607284" />
            </button>
          </>
        }
      />
      <div className="text-xs italic font-normal text-right">
        Available in Liftoscript as <strong>{props.rmKey}</strong> variable
      </div>
      {showCalculator && (
        <Modal shouldShowClose={true} onClose={() => setShowCalculator(false)}>
          <RepMaxCalculator
            backLabel="Close"
            unit={props.units}
            onSelect={(weightValue) => {
              if (weightValue != null) {
                props.onEditVariable(weightValue);
              }
              setShowCalculator(false);
            }}
          />
        </Modal>
      )}
    </section>
  );
}
