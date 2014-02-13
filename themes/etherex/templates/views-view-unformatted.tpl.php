<?php
/**
 * @file views-view-unformatted.tpl.php
 * Default simple view template to display a list of rows.
 *
 * @ingroup views_templates
 */
?>
<?php if (!empty($title)): ?>
  <h3><?php print $title; ?></h3>
<?php endif; ?>
<?php foreach ($rows as $id => $row): ?>
  <?php if ($id % 3 == 0): ?>
  <div class="views-row-row clearfix">
  <?php endif; ?>
  <div class="<?php print $classes[$id]; ?>">
    <?php print $row; ?>
  </div>
  <?php if ($id % 3 == 2 || ($id + 1) == count($rows)): ?>
  </div>
  <?php endif; ?>
<?php endforeach; ?>