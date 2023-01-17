using System.Web.Optimization;

namespace InventoryTracker_WebApp
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js").Include("~/Scripts/jqueryui/jquery-ui.js").Include("~/Scripts/Spectrum/spectrum.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new Bundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.bundle.js",
                      "~/Scripts/bootstrap-datepicker/js/bootstrap-datepicker.min.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/site.css",
                      "~/Scripts/jqueryui/themes/base/jquery-ui-min.css",
                      "~/Scripts/jqueryui/themes/base/jquery-ui.css",
                      "~/Scripts/bootstrap-datepicker/css/bootstrap-datepicker.min.css",
                      "~/Scripts/Spectrum/spectrum.min.css"));
        }
    }
}
