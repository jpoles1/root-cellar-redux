<script lang="ts">
	import type { Recipe } from "./root";
    import NumInput from "$lib/input/NumInput.svelte";
	import TextInput from "./input/TextInput.svelte";

    export let recipe: Recipe
    export let editable: boolean = true

    // Recommended daily intake from US FDA: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
    const daily_val = {
      fat: 78,
      carbs: 275,
      protein: 50,
      fiber: 28,
      sugar: 50,
      sodium: 2300
    }
</script>


<div class="nutrition-facts">
    <header class="nutrition-facts__header">
        <h1 class="nutrition-facts__title">Nutrition Facts</h1>
        <div class="mb-0.5">
            <span>Serving Size:</span>
            <div class="inline-block w-[160px]">
                <TextInput bind:value="{recipe.serving_size}" placeholder="" class="w-[160px]" disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>
        </div>
        <div>
            <span>Serving Per Recipe:</span>
            <div class="inline-block w-[40px]">
                <NumInput bind:value="{recipe.servings}" placeholder="" class="w-[60px]" noarrows disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>
        </div>
    </header>
    <table class="nutrition-facts__table">
      <thead>
        <tr>
          <th colspan="3" class="small-info">
            Amount Per Serving
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th colspan="2">
            <b>Calories</b>
            <div class="inline-block w-[40px]">
                <NumInput bind:value="{recipe.calories}" placeholder="" class="w-[60px]" noarrows disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>
          </th>
          <td>
            Cal from Fat
            {((recipe.fat || 0) * 9).toFixed(1)}
          </td>
        </tr>
        <tr class="thick-row">
          <td colspan="3" class="small-info">
            <b>% Daily Value*</b>
          </td>
        </tr>
        <tr>
          <th colspan="2">
            <b>Total Fat</b>
            <div class="inline-block w-[40px]">
                <NumInput bind:value="{recipe.fat}" placeholder="" class="w-[50px]" noarrows disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>&nbsp;&nbsp;&nbsp;g
          </th>
          <td>
            <b>{((recipe.fat || 0) * 100 / daily_val.fat).toFixed(1)}%</b>
          </td>
        </tr>
        <!--<tr>
          <td class="blank-cell">
          </td>
          <th>
            Saturated Fat
            9g
          </th>
          <td>
            <b>22%</b>
          </td>
        </tr>
        <tr>
          <td class="blank-cell">
          </td>
          <th>
            Trans Fat
            0g
          </th>
          <td>
          </td>
        </tr>
        <tr>
          <th colspan="2">
            <b>Cholesterol</b>
            55mg
          </th>
          <td>
            <b>18%</b>
          </td>
        </tr>-->
        <tr>
          <th colspan="2">
            <b>Sodium</b>
            <div class="inline-block w-[40px]">
                <NumInput bind:value="{recipe.sodium}" placeholder="" class="w-[50px]" noarrows disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>&nbsp;&nbsp;&nbsp;mg
          </th>
          <td>
            <b>{((recipe.sodium || 0) * 100 / daily_val.sodium).toFixed(1)}%</b>
          </td>
        </tr>
        <tr>
          <th colspan="2">
            <b>Total Carbohydrate</b>
            <div class="inline-block w-[40px]">
                <NumInput bind:value="{recipe.carbs}" placeholder="" class="w-[50px]" noarrows disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>&nbsp;&nbsp;&nbsp;g
          </th>
          <td>
            <b>{((recipe.carbs || 0) * 100 / daily_val.carbs).toFixed(1)}%</b>
          </td>
        </tr>
        <tr>
          <td class="blank-cell">
          </td>
          <th>
            Dietary Fiber
            <div class="inline-block w-[40px]">
                <NumInput bind:value="{recipe.fiber}" placeholder="" class="w-[50px]" noarrows disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>&nbsp;&nbsp;&nbsp;g
          </th>
          <td>
            <b>{((recipe.fiber || 0) * 100 / daily_val.fiber).toFixed(1)}%</b>
          </td>
        </tr>
        <tr>
          <td class="blank-cell">
          </td>
          <th>
            Sugars
            <div class="inline-block w-[40px]">
                <NumInput bind:value="{recipe.sugar}" placeholder="" class="w-[50px]" noarrows disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>&nbsp;&nbsp;&nbsp;g
          </th>
          <td>
            <b>{((recipe.sugar || 0) * 100 / daily_val.sugar).toFixed(1)}%</b>
          </td>
        </tr>
        <tr class="thick-end">
          <th colspan="2">
            <b>Protein</b>
            <div class="inline-block w-[40px]">
                <NumInput bind:value="{recipe.protein}" placeholder="" class="w-[50px]" noarrows disabled="{!editable}" on:input on:change on:keydown on:keyup/>
            </div>&nbsp;&nbsp;&nbsp;g
          </th>
          <td>
            <b>{((recipe.protein || 0) * 100 / daily_val.protein).toFixed(1)}%</b>
          </td>
        </tr>
      </tbody>
    </table>
    <!--
    <table class="nutrition-facts__table--grid">
      <tbody>
        <tr>
          <td colspan="2">
            Vitamin A
            10%
          </td>
          <td>
            Vitamin C
            0%
          </td>
        </tr>
        <tr class="thin-end">
          <td colspan="2">
            Calcium
            10%
          </td>
          <td>
            Iron
            6%
          </td>
        </tr>
      </tbody>
    </table>
  
    <p class="small-info">* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs:</p>
  
    <table class="nutrition-facts__table--small small-info">
      <thead>
        <tr>
          <td colspan="2"></td>
          <th>Calories:</th>
          <th>2,000</th>
          <th>2,500</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th colspan="2">Total Fat</th>
          <td>Less than</td>
          <td>65g</td>
          <td>80g</td>
        </tr>
        <tr>
          <td class="blank-cell"></td>
          <th>Saturated Fat</th>
          <td>Less than</td>
          <td>20g</td>
          <td>25g</td>
        </tr>
        <tr>
          <th colspan="2">Cholesterol</th>
          <td>Less than</td>
          <td>300mg</td>
          <td>300 mg</td>
        </tr>
        <tr>
          <th colspan="2">Sodium</th>
          <td>Less than</td>
          <td>2,400mg</td>
          <td>2,400mg</td>
        </tr>
        <tr>
          <th colspan="3">Total Carbohydrate</th>
          <td>300g</td>
          <td>375g</td>
        </tr>
        <tr>
          <td class="blank-cell"></td>
          <th colspan="2">Dietary Fiber</th>
          <td>25g</td>
          <td>30g</td>
        </tr>
      </tbody>
    </table>
  
    <p class="small-info">
      Calories per gram:
    </p>
    <p class="small-info text-center">
      Fat 9
      &bull;
      Carbohydrate 4
      &bull;
      Protein 4
    </p>
    -->
</div>


<style lang="scss">

.image {
  width: 250px;
  float: left;
  margin: 20px;
}
body {
  font-size: small;
  line-height: 1.4;
}
p {
  margin: 0;
}

.nutrition-facts {
  border: 1px solid black;
  margin: 20px;
  float: left;
  width: 350px;
  padding: 0.5rem;
  table {
    border-collapse: collapse;
  }
}
.nutrition-facts__title {
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0 0 0.25rem 0;
}
.nutrition-facts__header {
  border-bottom: 10px solid black;
  padding: 0 0 0.25rem 0;
  margin: 0 0 0.5rem 0;
  p {
    margin: 0;
  }
}
.nutrition-facts__table {
  width: 100%;
  thead tr {
    th,
    td {
      border: 0;
    }
  }
  th,
  td {
    font-weight: normal;
    text-align: left;
    padding: 0.2rem 0;
    border-top: 1px solid black;
    white-space: nowrap;
  }
  td {
    &:last-child {
      text-align: right;
    }
  }
  .blank-cell {
    width: 1rem;
    border-top: 0;
  }
  .thick-row {
    th,
    td {
      border-top-width: 5px;
    }
  }
}
.small-info {
  font-size: 0.7rem;
}

.nutrition-facts__table--small {
  @extend .nutrition-facts__table;
  border-bottom: 1px solid #999;
  margin: 0 0 0.5rem 0;
  thead {
    tr {
      border-bottom: 1px solid black;
    }
  }
  td {
    &:last-child {
      text-align: left;
    }
  }
  th,
  td {
    border: 0;
    padding: 0;
  }
}

.nutrition-facts__table--grid {
  @extend .nutrition-facts__table;
  margin: 0 0 0.5rem 0;
  td {
    &:last-child {
      text-align: left;
      &::before {
        content: "•";
        font-weight: bold;
        margin: 0 0.25rem 0 0;
      }
    }
  }
}

.text-center {
  text-align: center;
}
.thick-end {
  border-bottom: 10px solid black;
}
.thin-end {
  border-bottom: 1px solid black;
}

</style>
